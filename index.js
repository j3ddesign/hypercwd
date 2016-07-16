const { exec } = require('child_process');

let curPid;
let uids = {};

const setCwd = (pid) =>
  exec(`lsof -p ${pid} | grep cwd | awk '$4 == "cwd" {print $9}'`, (err, cwd) => {
    if (err) {
      console.error(err);
    } else {
      cwd = cwd.trim();
      store.dispatch({
        type: 'UPDATE_CWD',
        cwd
      });
    }
  });

exports.middleware = (store) => (next) => (action) => {
  switch (action.type) {
    case 'SESSION_ADD_DATA':
      if (curPid) setCwd(curPid);
      break;
    case 'SESSION_ADD':
      uids[action.uid] = action.pid;
      curPid = action.pid;
      setCwd(curPid);
      break;
    case 'SESSION_SET_ACTIVE':
      curPid = uids[action.uid];
      setCwd(curPid);
      break;
    case 'SESSION_PTY_EXIT':
      delete uids[action.uid];
      break;
    case 'SESSION_USER_EXIT':
      delete uids[action.uid];
      break;
  }
  next(action);
};

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CWD':
      return state.set('cwd', action.cwd);
  }
  return state;
};