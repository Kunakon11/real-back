require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const evaluateeRoutes = require('./routes/evaluatee.routes');
const evaluatorRoutes = require('./routes/evaluator.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();

const allowedOrigins = [
    'http://185.84.160.96',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger setup
try {
    const swaggerDocument = YAML.load('./swagger.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.log("Swagger UI definition not found or invalid.");
}

const crudRoutes = require('./routes/crud.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/crud', crudRoutes); // Dedicated FULL CRUD for requirement check
app.use('/api/me', evaluateeRoutes);
app.use('/api/evaluator', evaluatorRoutes);
app.use('/api/reports', reportsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
