// lib/constructs/roles/iam-roles-construct.ts
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface IAMRolesConstructProps {
  sentinelBucket: s3.IBucket;
  region: string;
  account: string;
  dynamoTableArn: string;
}

export class IAMRolesConstruct extends Construct {
  public readonly instanceRole: iam.Role;
  public readonly buildRole: iam.Role;
  public readonly codeDeployServiceRole: iam.Role;
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string, props: IAMRolesConstructProps) {
    super(scope, id);

    // Lambda Role
    this.lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda functions with DynamoDB access',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add DynamoDB read permissions for Lambda
    this.lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
      ],
      resources: [
        props.dynamoTableArn,
        `${props.dynamoTableArn}/index/*`, // Allow access to all indexes
      ]
    }));

    // EC2 Instance Role
    this.instanceRole = new iam.Role(this, 'EC2Role', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeDeployFullAccess'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
        ],
        inlinePolicies: {
          'DynamoDBFullAccess': new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'dynamodb:PutItem',
                  'dynamodb:GetItem',
                  'dynamodb:UpdateItem',
                  'dynamodb:DeleteItem',
                  'dynamodb:BatchGetItem',
                  'dynamodb:BatchWriteItem',
                  'dynamodb:Query',
                  'dynamodb:Scan',
                  'dynamodb:DescribeTable',
                  'dynamodb:CreateTable',
                  'dynamodb:DeleteTable',
                  'dynamodb:ListTables'
                ],
                resources: [
                  props.dynamoTableArn,
                  `${props.dynamoTableArn}/*`,
                  `arn:aws:dynamodb:${props.region}:${props.account}:table/*`  // Add wildcard for table listing
                ]
              })
            ]
          })
        }
      });

    // CodeDeploy permissions for instance role
    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'codedeploy:*',
        'ec2:DescribeInstances',
        'ec2:DescribeTags',
        'ec2:DescribeInstanceStatus',
        'tag:GetResources',
        'tag:GetTagKeys',
        'tag:GetTagValues',
        's3:Get*',
        's3:List*',
        's3:PutObject',
        's3:PutObjectAcl',
        's3:DeleteObject'
      ],
      resources: ['*']
    }));

    // EC2 instance describe permissions
    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ec2:DescribeInstanceAttribute',
        'ec2:DescribeInstanceStatus',
        'ec2:DescribeInstances',
        'ec2:DescribeTags'
      ],
      resources: ['*']
    }));

    // IAM permissions for CodeDeploy agent
    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'iam:GetRole',
        'iam:PassRole',
        'iam:ListRoles',
      ],
      resources: ['*']
    }));

    // S3 bucket permissions for instance role
    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket',
        's3:PutObject',
        's3:GetObjectVersion'
      ],
      resources: [
        props.sentinelBucket.bucketArn,
        `${props.sentinelBucket.bucketArn}/*`
      ]
    }));

    this.instanceRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:DescribeTable'
        ],
        resources: [
          props.dynamoTableArn,
          `${props.dynamoTableArn}/*`
        ]
    }));

    // Build Role
    this.buildRole = new iam.Role(this, 'BuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeBuildAdminAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
    });

    // S3 permissions for build role
    props.sentinelBucket.grantReadWrite(this.buildRole);

    // CodeDeploy permissions for build role
    this.buildRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:GetObject',
        's3:ListBucket',
        'codedeploy:CreateDeployment',
        'codedeploy:GetDeployment',
        'codedeploy:GetDeploymentConfig',
        'codedeploy:RegisterApplicationRevision',
        'codedeploy:GetApplicationRevision',
        'codedeploy:GetDeploymentTarget',
        'codedeploy:ListDeployments'
      ],
      resources: [
        `${props.sentinelBucket.bucketArn}/*`,
        props.sentinelBucket.bucketArn,
        `arn:aws:codedeploy:${props.region}:${props.account}:deploymentgroup:GalvitronApplication/GalvitronDeploymentGroup`,
        `arn:aws:codedeploy:${props.region}:${props.account}:application:GalvitronApplication`,
        `arn:aws:codedeploy:${props.region}:${props.account}:deploymentconfig:*`
      ]
    }));

    this.buildRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'codecommit:GitPull',
        'codecommit:GitPush',
        'codecommit:GitBranch',
        'codecommit:ListBranches',
        'codecommit:CreateCommit',
        'codecommit:GetCommit',
        'codecommit:GetRepository',
        'codecommit:ListRepositories'
      ],
      resources: ['*']  // Scope this down to specific repositories as needed
    }));

    // CodeDeploy Service Role
    this.codeDeployServiceRole = new iam.Role(this, 'CodeDeployServiceRole', {
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSCodeDeployRole'),
      ],
    });

    // Additional permissions for CodeDeploy service role
    this.codeDeployServiceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ec2:Describe*',
        'tag:GetTags',
        'tag:GetResources',
        'tag:GetTagValues',
        'tag:GetTagKeys',
        'autoscaling:*',
        'ec2:RunInstances',
        'ec2:CreateTags',
        'iam:PassRole'
      ],
      resources: ['*']
    }));

    // CloudWatch Logs permissions for all roles
    const cloudwatchPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams',
        'logs:DescribeLogGroups'
      ],
      resources: [`arn:aws:logs:${props.region}:${props.account}:log-group:*`]
    });

    this.instanceRole.addToPolicy(cloudwatchPolicy);
    this.buildRole.addToPolicy(cloudwatchPolicy);
    this.codeDeployServiceRole.addToPolicy(cloudwatchPolicy);

    // Additional security measures
    this.addSecurityHeaders();
  }

  private addSecurityHeaders() {
    // Add security headers to all roles
    const securityHeadersPolicy = new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ['*'],
      resources: ['*'],
      conditions: {
        'Bool': {
          'aws:SecureTransport': false
        }
      }
    });

    this.instanceRole.addToPolicy(securityHeadersPolicy);
    this.buildRole.addToPolicy(securityHeadersPolicy);
    this.codeDeployServiceRole.addToPolicy(securityHeadersPolicy);
  }
}