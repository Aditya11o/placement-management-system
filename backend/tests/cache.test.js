const { cache, clearCache } = require('../src/middlewares/cacheMiddleware');
const httpMocks = require('node-mocks-http');

// Global mock for logger and redis
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

// We'll mock the config/redis module directly
const mockRedisClient = {
    isReady: true,
    get: jest.fn(),
    setEx: jest.fn(),
    scan: jest.fn(),
    del: jest.fn()
};

jest.mock('../src/config/redis', () => ({
    getRedisClient: () => mockRedisClient
}));

describe('Redis Cache Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/api/v1/jobs/eligible',
            originalUrl: '/api/v1/jobs/eligible'
        });
        res = httpMocks.createResponse();
        next = jest.fn();

        // Reset all mock functions before each test
        jest.clearAllMocks();

        // Force NODE_ENV to something other than test so the middleware runs
        process.env.NODE_ENV = 'development';
    });

    afterAll(() => {
        process.env.NODE_ENV = 'test'; // Restore for other test suites
    });

    it('should call next() and bypass caching if Redis is not ready', async () => {
        mockRedisClient.isReady = false;

        const middleware = cache(300);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(mockRedisClient.get).not.toHaveBeenCalled();

        mockRedisClient.isReady = true; // reset
    });

    it('should return cached JSON immediately on cache hit', async () => {
        const cachedData = { success: true, data: [{ id: 1, title: 'Job' }] };
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(cachedData));

        const middleware = cache(300);
        await middleware(req, res, next);

        expect(mockRedisClient.get).toHaveBeenCalledWith('cache:/api/v1/jobs/eligible');
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(cachedData);
        expect(next).not.toHaveBeenCalled(); // We intercept and return, no next()
    });

    it('should intercept res.json on cache miss and store data in Redis', async () => {
        mockRedisClient.get.mockResolvedValueOnce(null); // Cache miss

        const middleware = cache(300);
        await middleware(req, res, next);

        expect(mockRedisClient.get).toHaveBeenCalledWith('cache:/api/v1/jobs/eligible');
        expect(next).toHaveBeenCalled();

        // Simulate the controller executing successfully
        const responseData = { success: true, data: ['new-job'] };
        res.status(200).json(responseData);

        expect(mockRedisClient.setEx).toHaveBeenCalledWith(
            'cache:/api/v1/jobs/eligible',
            300,
            JSON.stringify(responseData)
        );
    });

    it('clearCache should scan and delete relevant keys', async () => {
        mockRedisClient.scan.mockResolvedValueOnce({
            cursor: 0,
            keys: ['cache:/api/v1/jobs/123', 'cache:/api/v1/jobs/eligible']
        });

        await clearCache('/api/v1/jobs');

        expect(mockRedisClient.scan).toHaveBeenCalledWith(0, { MATCH: 'cache:/api/v1/jobs*', COUNT: 100 });
        expect(mockRedisClient.del).toHaveBeenCalledWith(['cache:/api/v1/jobs/123', 'cache:/api/v1/jobs/eligible']);
    });
});
