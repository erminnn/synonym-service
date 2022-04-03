import app from './app';
import mongoose from 'mongoose';

// Connect to database
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .catch((error) => {
        console.log(error);
        process.exit(-1);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port 3000'));
