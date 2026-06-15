const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error); // ✅ Pass error to Express — this STOPS the middleware chain
    }
};

export { asyncHandler };