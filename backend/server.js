const http = require('http')

const hostname = '127.0.0.1'

const port = 3000


const server = http.createServer((req,res) => {
    res.statusCode = 200
    res.setHeader('Content-type', 'Application/Json')
    res.setHeader('Access-Control-Allow-Origin','*')

    const {method, url} = req

    res.write('Hello from Node.js!')

    res.end()
})

server.listen(port, hostname, () => {
    console.log(`Server running at ${hostname}:${port}.`)
})

