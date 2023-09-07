import 'module-alias/register';
import App from "./index"
import UserRouter from '@/routes/user'

const app = new App()
app.useRoute('/user',UserRouter)
.closeMongoose()
.closeRedis()
.start(5000)

