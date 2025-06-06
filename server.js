require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require('ejs-mate');
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const { pageNotFound } = require('./utils/pageNotFound');
const { errorHandler } = require('./utils/centralizedErrorHandler');
const compression = require('compression');

const minifyHTML = require('./utils/HTMLMinifier');
const { timeFormatterGlobal } = require('./utils/timeFormatter');
const authenticateUser = require('./middleware/authenticate');
const cookieParser = require('cookie-parser');
const seoBuilder = require('./utils/seoBuilder');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(compression());

app.use(cookieParser());
app.use(authenticateUser);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(minifyHTML);
app.use(seoBuilder.middleware());

app.use(timeFormatterGlobal);

app.engine('ejs', ejsMate);

const mainRouter = require('./routes');

app.use('/', mainRouter);

app.use(pageNotFound);
app.use(errorHandler);

connectDB();
app.listen(PORT, () => logger.success(`Server is connected to http://localhost:${PORT}`));