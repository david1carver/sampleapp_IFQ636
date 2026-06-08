// backend/test/auth.test.js
// Unit tests for authentication functionality (register / login).
// Pure unit tests — User model statics, bcrypt and the JWT secret are stubbed/set.

const chai = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { registerUser, loginUser } = require('../controllers/authController');

const expect = chai.expect;
const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('authController (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-A-01
  it('registerUser returns 201 with a token for a new email', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves({ id: 'u1', name: 'Ann', email: 'ann@test.com', role: 'diner' });

    const req = { body: { name: 'Ann', email: 'ann@test.com', password: 'secret123' } };
    const res = mockRes();
    await registerUser(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body).to.include({ email: 'ann@test.com' });
    expect(body.token).to.be.a('string');
  });

  // TC-A-02
  it('registerUser returns 400 when the email already exists', async () => {
    sinon.stub(User, 'findOne').resolves({ id: 'u1', email: 'ann@test.com' });
    const req = { body: { name: 'Ann', email: 'ann@test.com', password: 'secret123' } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  // TC-A-03
  it('loginUser returns 200 with a token for valid credentials', async () => {
    sinon.stub(User, 'findOne').resolves({
      id: 'u1', name: 'Ann', email: 'ann@test.com', role: 'diner', password: 'hashed',
    });
    sinon.stub(bcrypt, 'compare').resolves(true);

    const req = { body: { email: 'ann@test.com', password: 'secret123' } };
    const res = mockRes();
    await loginUser(req, res);

    const body = res.json.firstCall.args[0];
    expect(body.token).to.be.a('string');
    expect(body).to.include({ email: 'ann@test.com' });
  });

  // TC-A-04
  it('loginUser returns 401 for an invalid password', async () => {
    sinon.stub(User, 'findOne').resolves({
      id: 'u1', name: 'Ann', email: 'ann@test.com', role: 'diner', password: 'hashed',
    });
    sinon.stub(bcrypt, 'compare').resolves(false);

    const req = { body: { email: 'ann@test.com', password: 'wrong' } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });

  // TC-A-05
  it('loginUser returns 401 when the user does not exist', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const req = { body: { email: 'nobody@test.com', password: 'x' } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });
});
