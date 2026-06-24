// backend/test/notifications.test.js
// Unit tests for the new Notifications subsystem controller paths.

const chai = require('chai');
const sinon = require('sinon');
const Notification = require('../models/Notification');
const ctrl = require('../controllers/notificationController');

const expect = chai.expect;
const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('notificationController (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  // TC-N-01
  it('createNotification returns 201 for the current user', async () => {
    sinon.stub(Notification, 'create').resolves({ _id: 'n1', message: 'hi' });
    const req = { user: { _id: 'user1', role: 'diner' }, body: { message: 'hi' } };
    const res = mockRes();
    await ctrl.createNotification(req, res);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ _id: 'n1', message: 'hi' });
  });

  // TC-N-02
  it('createNotification returns 400 when message is missing', async () => {
    const req = { user: { _id: 'user1', role: 'diner' }, body: {} };
    const res = mockRes();
    await ctrl.createNotification(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  // TC-N-03
  it('listMyNotifications returns the user\'s notifications', async () => {
    const list = [{ _id: 'n1' }, { _id: 'n2' }];
    sinon.stub(Notification, 'find').returns({ sort: sinon.stub().resolves(list) });
    const req = { user: { _id: 'user1' }, query: {} };
    const res = mockRes();
    await ctrl.listMyNotifications(req, res);
    expect(res.json.firstCall.args[0]).to.deep.equal(list);
  });

  // TC-N-04
  it('unreadCount returns the count of unread notifications', async () => {
    sinon.stub(Notification, 'countDocuments').resolves(4);
    const req = { user: { _id: 'user1' } };
    const res = mockRes();
    await ctrl.unreadCount(req, res);
    expect(res.json.firstCall.args[0]).to.deep.equal({ count: 4 });
  });

  // TC-N-05
  it('markRead returns 200 when the owner marks it read', async () => {
    sinon.stub(Notification, 'findById').resolves({ _id: 'n1', userId: 'user1' });
    sinon.stub(Notification, 'findByIdAndUpdate').resolves({ _id: 'n1', read: true });
    const req = { params: { id: 'n1' }, user: { _id: 'user1' } };
    const res = mockRes();
    await ctrl.markRead(req, res);
    expect(res.json.firstCall.args[0]).to.deep.equal({ _id: 'n1', read: true });
  });

  // TC-N-06
  it('markRead returns 403 when marking someone else\'s notification', async () => {
    sinon.stub(Notification, 'findById').resolves({ _id: 'n1', userId: 'user2' });
    const req = { params: { id: 'n1' }, user: { _id: 'user1' } };
    const res = mockRes();
    await ctrl.markRead(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  // TC-N-07
  it('markRead returns 404 when the notification does not exist', async () => {
    sinon.stub(Notification, 'findById').resolves(null);
    const req = { params: { id: 'nope' }, user: { _id: 'user1' } };
    const res = mockRes();
    await ctrl.markRead(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });
});
