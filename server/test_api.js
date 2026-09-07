const http = require('http');
const fs = require('fs');

http.get('http://localhost:5000/api/skl/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        const firstId = parsed.data[0].id;
        console.log("ID:", firstId);
        
        http.get(`http://localhost:5000/api/skl/cetak-berkas/${firstId}`, (res2) => {
            console.log("Status:", res2.statusCode);
            console.log("Content-Type:", res2.headers['content-type']);
            const fileStream = fs.createWriteStream('test_output.pdf');
            res2.pipe(fileStream);
            fileStream.on('finish', () => {
                console.log("Saved test_output.pdf");
            });
        });
    });
});
