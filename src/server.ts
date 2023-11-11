import moduleAlias from 'module-alias'
import path from 'path'

// set module-alias for absolute path @
moduleAlias.addAliases({
    '@': path.resolve('./' + (process.env.NODE_ENV == 'production' ? 'dist' : 'src'))
})

moduleAlias()

import App from "./index"
import UserRouter from '@/routes/user'
import AdminRouter from '@/routes/admin'

const app = new App()
app.useRoute('/user', UserRouter)
.useRoute('/admin', AdminRouter)
.closeMongoose()
.closeRedis()
.start(5000)