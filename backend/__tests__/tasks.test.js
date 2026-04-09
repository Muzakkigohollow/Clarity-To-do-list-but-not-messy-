const request = require('supertest');
const app = require('../app');
const db = require('../db');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, cb) => cb(null, { id: 1, username: 'testuser' }))
}));

jest.mock('../db', () => ({
    query: jest.fn()
}));

describe('Tasks API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/tasks returns list of tasks', async () => {
        const mockTasks = [
            { id: 1, title: 'Test Task', priority: 'HIGH', status: 'PENDING' }
        ];
        db.query.mockResolvedValue([mockTasks]);

        const response = await request(app).get('/api/tasks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTasks);
    });

    test('POST /api/tasks creates a task', async () => {
        db.query.mockResolvedValue([{ insertId: 42 }]);

        const response = await request(app)
            .post('/api/tasks')
            .send({ title: 'New task', priority: 'LOW' });
        
        expect(response.status).toBe(201);
        expect(response.body.title).toBe('New task');
        expect(response.body.priority).toBe('LOW');
        expect(response.body.id).toBe(42);
    });

    test('PATCH /api/tasks/:id toggles status', async () => {
        // Mock a quick returning value for the GET inside patchTask since patchTask checks existence first
        db.query.mockResolvedValue([[{ id: 42, title: 'Old task', status: 'PENDING' }]]);

        // After the SELECT, we update
        const response = await request(app)
            .patch('/api/tasks/42')
            .set('Authorization', 'Bearer fake')
            .send({ status: 'DONE' });
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('DONE');
    });

    test('POST /api/tasks returns 400 on invalid payload', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', 'Bearer fake')
            .send({ title: '', priority: 'INVALID_PRIORITY' });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid title');
    });

    test('PATCH /api/tasks/:id returns 404 on nonexistent task', async () => {
        // Mock SELECT returns empty array meaning task not found
        db.query.mockResolvedValue([[]]);

        const response = await request(app)
            .patch('/api/tasks/999')
            .set('Authorization', 'Bearer fake')
            .send({ status: 'DONE' });
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

    test('Integration check against Database Circuit Breaker', async () => {
        // Manually simulate a broken DB circuit
        const dbMod = require('../db');
        const oldIsHealthy = dbMod.isHealthy;
        dbMod.isHealthy = false;
        
        const response = await request(app).get('/api/tasks');
        expect(response.status).toBe(503);
        
        dbMod.isHealthy = oldIsHealthy;
    });

    test('GET /api/tasks/stats returns task stats for a date range', async () => {
        db.isHealthy = true; // Ensure circuit breaker is healthy
        db.query.mockResolvedValue([[{ date: '2026-04-01', count: 5 }]]);

        const response = await request(app)
            .get('/api/tasks/stats?startDate=2026-04-01&endDate=2026-04-30')
            .set('Authorization', 'Bearer fake');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ date: '2026-04-01', count: 5 }]);
    });

    test('GET /api/tasks/stats returns 400 on missing dates', async () => {
        db.isHealthy = true; // Ensure circuit breaker is healthy
        const response = await request(app)
            .get('/api/tasks/stats')
            .set('Authorization', 'Bearer fake');
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('startDate and endDate required');
    });
});
