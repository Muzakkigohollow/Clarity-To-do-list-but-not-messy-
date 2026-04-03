const request = require('supertest');
const app = require('../app');
const db = require('../db');

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

    test('PATCH /api/tasks/:id/status toggles status', async () => {
        db.query.mockResolvedValue([{ affectedRows: 1 }]);

        const response = await request(app)
            .patch('/api/tasks/42/status')
            .send({ status: 'DONE' });
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('DONE');
    });
});
