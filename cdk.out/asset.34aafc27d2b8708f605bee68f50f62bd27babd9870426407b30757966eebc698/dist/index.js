export const handler = async (event) => {
    const now = new Date();
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Hello, World!',
            timestamp: now.toISOString(),
            datetime: now.toLocaleString(),
        })
    };
};
