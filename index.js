const Parser = require('imap-parser')
const net = require('net')

const CAPS = ['IMAP4rev1', 'SASL-IR']

const send = function(id, cmd, info) {
  var msg = (id?id:'*')+' '+cmd.toUpperCase()+' '+info
  return msg+'\r\n'
};

const server = net.createServer((c) => {
  const parse = new Parser()

  console.log('client connected');
  
  parse.on('log', (e) => {
    console.log('log goes here', e)
  })

  parse.on('data', (line) => {
    console.log(line)
    const cmd = line[1].toUpperCase()

    if (cmd === 'CAPABILITY') {
      console.log('* CAPABILITY IMAP4rev1 STARTTLS AUTH=GSSAPI LOGINDISABLED\r\n')
      c.write('* CAPABILITY IMAP4rev1 STARTTLS AUTH=GSSAPI LOGINDISABLED\r\n')
    } else if (cmd === 'LOGOUT') {
      c.write('* BYE Courier-IMAP server shutting down\r\n')
    } else {
      c.write('* BAD\r\n')
    }
  })
  
  c.on('end', () => {
    console.log('client disconnected');
  });
  //const welcomeMessage = send(null, 'OK', 'IMAP4rev1 Service Ready, Powered by Postal')
  const welcomeMessage = '* OK IMAP4rev1 Postal Server Ready\r\n'
  console.log(welcomeMessage)
  c.write(welcomeMessage)
  
  c.pipe(parse);
});
server.on('error', (err) => {
  console.log(err)
  throw err;
});
server.listen(143, () => {
  console.log('server bound');
});