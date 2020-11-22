const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const uuid = require('uuid');
const net = require('net');
const { openWebsite } = require('./everyday/open.website');
const { dbInitialize, dbSelectAsync, dbModifyAsync } = require('./everyday/db');
const { logger } = require('./everyday/log');
const { fileDirOpen } = require('./everyday/file.open');


/* Web-Content Extension */
const apiUid = uuid.v4();
const apiHost = '127.0.0.1'
let apiUrl = null;
let apiPort = null;

const checkPortIsFree = async (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`PORT ${port} in use`)
        resolve(true);
      }
    });
    server.once('listening', () => {
      // close the server if listening doesn't fail
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}
const newApiPort = async () => {
  const max = 36900;
  const min = 36666;
  let port = null;
  let assigned = true;
  while (assigned) {
    port = Math.floor(Math.random() * (max - min) + min);
    assigned = false;// await checkPortIsFree(port);
    logger.log(assigned);
  }
  apiPort = port;
  apiUrl = `http://${apiHost}:${apiPort}/${apiUid}`;
};
const setContentApi = () => {
  const manifestPath = path.join(__dirname, './everyday/extension/web-content/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  manifest.api = apiUrl;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '))
};

//-------------------
// IPC
//-------------------

/*class IpcRequest {
  constructor (seq, name, data) {
    this.seq = seq;
    this.name = name;
    this.data = data;
  }
}*/

class IpcResponse {
  constructor(seq, status, data) {
    this.seq = seq;
    this.status = status;
    this.data = data;
  }
}

ipcMain.on('perun-request', async (event, arg) => {
  logger.log(event, arg);
  let status = 200;
  let data = null;
  switch(arg.name) {
    /*case 'open.file': {
      try {
        data = await openFile(arg.data);
      } catch (e) {
        status = 400;
        data = e;
      }
      break;
    }*/
    case 'open.website': {
      openWebsite(arg.data);
      break;
    }
    case 'workspace.all': {
      data = await dbSelectAsync(`SELECT * from workspace`);
      break;
    }
    case 'workspace.add': {
      await fileDirOpen();
      // data = await dbModifyAsync(`INSERT INTO workspace path * from workspace`);
      break;
    }
    default: {
      logger.warn('not implemented !');
    }
  }
   // Event emitter for sending asynchronous messages
   event.sender.send('perun-reply', new IpcResponse(arg.seq, status, data))
});

//-------------------
// Main Window
//-------------------

const launchMain = async () => {
  try {
    const firstStart = await dbInitialize();
    await newApiPort();
    setContentApi(false);
    startServer();
  } catch (e) {
    logger.error(e);
    app.quit();
  }
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  global.mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'main.preload.js')
    }
  })
  global.mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'public/index.html'),
      protocol: 'file:',
      slashes: true
  }));
}

app.whenReady().then(launchMain)

app.on("window-all-closed", () => {
  //if (process.platform !== "darwin") {
    app.quit();
  //}
});
// clean api url
app.on('before-quit', async () => {
  logger.debug('before quit data');
})

/* API Server */
const readRequestBody = (req) => {
  let body = '';
  return new Promise((resolve, reject) => {
    req.on('data', function (chunk) {
      body += chunk;
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}
const startServer = () => {
  const http = require('http');
  const server = http.createServer(async (req, res) => {
    if (req.url === `/${apiUid}`) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const body = await readRequestBody(req);
      logger.log(body);
      const b = JSON.parse(body);
      b.msg = 'Hello world !';
      res.end(JSON.stringify(b));
    } else {
      req.statusCode = 404;
      res.end();
    }
  });

  server.listen(apiPort, apiHost, () => {
    logger.log(`Server running at http://${apiHost}:${apiPort}/`);
  });
};
