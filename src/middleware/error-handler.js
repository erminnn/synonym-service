export default async (err, req, res, next) => {
    // Specific validation error handler
    if (err.statusCode) res.status(err.statusCode).send(err);
    // Generic error handler
    else
        res.status(err.statusCode || 500).send({
            error: {
                type: err.type || 'internal_server_error',
                message: err.message || 'Unexpected internal server error.',
                details: err.details,
                success: false
            }
        });
};
