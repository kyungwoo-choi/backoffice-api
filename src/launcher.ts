import Application from "./App"

import ApiRouter from './api/ApiRouter'

const app = new Application([
    new ApiRouter()
], 3002);

app.listen();
