const bcrypt = require('bcryptjs');

bcrypt.hash('adminsebisogob', 10)
.then(console.log);