const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const session=require('express-session')
const { MongoStore } = require('connect-mongo');
const User = require('./models/user');
const Review=require('./models/review');
const Watchlist=require('./models/watchlist');
const WatchProgress = require('./models/watchProgress');
const { StreamingProviderManager } = require('./providers');
const axios = require('axios');
require('dotenv').config();
const app = express();

const {loginschema,signupschema}=require('./models/validation');
const watchlist = require('./models/watchlist');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.png'));
});

const tmdbParams = () => ({
    api_key: process.env.TMDB_API_KEY
});

function shuffleMovies(movies) {
    return movies
        .map(movie => ({ movie, sort: Math.random() }))
        .sort((first, second) => first.sort - second.sort)
        .map(({ movie }) => movie);
}

async function addReviewStats(items, mediaType = 'movie') {
    if (!items || items.length === 0) return items;
    const ids = items.map(item => Number(item.id));
    try {
        const reviews = await Review.find({ tmdbId: { $in: ids }, mediaType: mediaType });
        const reviewsMap = {};
        reviews.forEach(review => {
            if (!reviewsMap[review.tmdbId]) {
                reviewsMap[review.tmdbId] = [];
            }
            reviewsMap[review.tmdbId].push(review);
        });

        for (let item of items) {
            const itemReviews = reviewsMap[item.id] || [];
            item.numReviews = itemReviews.length;
            if (itemReviews.length > 0) {
                const total = itemReviews.reduce((sum, review) => sum + review.rating, 0);
                item.avgRating = total / itemReviews.length;
            } else {
                item.avgRating = 0;
            }
        }
    } catch (err) {
        console.error('Error in addReviewStats:', err);
    }
    return items;
}

async function getRandomRelevantMovies() {
    const randomPage = Math.floor(Math.random() * 8) + 1;
    const randomYear = Math.floor(Math.random() * 45) + 1980;
    const discoveryRequests = [
        axios.get('https://api.themoviedb.org/3/movie/top_rated', {
            params: {
                ...tmdbParams(),
                page: randomPage
            }
        }),
        axios.get('https://api.themoviedb.org/3/trending/movie/week', {
            params: tmdbParams()
        }),
        axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
                ...tmdbParams(),
                sort_by: 'popularity.desc',
                'vote_count.gte': 500,
                primary_release_year: randomYear,
                page: 1
            }
        })
    ];

    const responses = await Promise.all(discoveryRequests);
    const moviesById = new Map();

    responses.forEach(response => {
        if (response.data && response.data.results) {
            response.data.results.forEach(movie => {
                if (movie.poster_path && !moviesById.has(movie.id)) {
                    moviesById.set(movie.id, movie);
                }
            });
        }
    });

    return addReviewStats(shuffleMovies([...moviesById.values()]).slice(0, 8));
}

async function getRandomRelevantSeries() {
    const randomPage = Math.floor(Math.random() * 8) + 1;
    const discoveryRequests = [
        axios.get('https://api.themoviedb.org/3/tv/top_rated', {
            params: {
                ...tmdbParams(),
                page: randomPage
            }
        }),
        axios.get('https://api.themoviedb.org/3/trending/tv/week', {
            params: tmdbParams()
        }),
        axios.get('https://api.themoviedb.org/3/discover/tv', {
            params: {
                ...tmdbParams(),
                sort_by: 'popularity.desc',
                'vote_count.gte': 100,
                page: 1
            }
        })
    ];

    const responses = await Promise.all(discoveryRequests);
    const seriesById = new Map();

    responses.forEach(response => {
        if (response.data && response.data.results) {
            response.data.results.forEach(series => {
                if (series.poster_path && !seriesById.has(series.id)) {
                    seriesById.set(series.id, series);
                }
            });
        }
    });

    return addReviewStats(shuffleMovies([...seriesById.values()]).slice(0, 8), 'tv');
}
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Movies';
mongoose.connect(dbUrl)


.then(function () {
    console.log('DB connected');
})
.catch(function (err) {
    console.log('DB error:', err.message);
});
app.use(session({
    secret:'secretkey',
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({
        mongoUrl: dbUrl
    })
}))
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.searchQuery = req.query.q || '';
    res.locals.selectedGenre = '';
    res.locals.selectedYear = '';
    res.locals.selectedSort = '';
    res.locals.showFilters = false;
    res.locals.randomMovies = [];
    res.locals.randomSeries = [];
    next();
});
app.use(async (req, res, next) => {
    res.locals.currentUser = null;
    if(req.session.userId){
        const user = await User.findById(
            req.session.userId
        );
        res.locals.currentUser = user;
    }
    next();
});
app.get('/', async (req, res)=> {
    try {
        const search = req.query.q;
        const genre = req.query.genre || '';
        const year = req.query.year || '';
        const sort = req.query.sort || 'popularity.desc';

        let allMovies=[];
        let randomMovies=[];
        let pageTitle = 'Browse Movies';
        let pageSubtitle = 'Rate films, read quick reactions, and find your next watch.';

        if (search) {
            const response = await axios.get(
                'https://api.themoviedb.org/3/search/movie', {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    query: search,
                    primary_release_year: year || undefined
                }
            });
            allMovies = response.data.results || [];
            await addReviewStats(allMovies);
            pageTitle = 'Search results for "' + search + '"';
            pageSubtitle = allMovies.length + ' movies found';
        } else if (genre || year || sort !== 'popularity.desc') {
            const response = await axios.get(
                'https://api.themoviedb.org/3/discover/movie', {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    with_genres: genre || undefined,
                    primary_release_year: year || undefined,
                    sort_by: sort
                }
            });
            allMovies = response.data.results || [];
            await addReviewStats(allMovies);
            pageTitle = 'Filtered Movies';
            pageSubtitle = allMovies.length + ' movies matched your criteria';
        } else {
            const response = await axios.get(
                'https://api.themoviedb.org/3/movie/popular',
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY
                    }
                }
            );
            allMovies = response.data.results || [];
            await addReviewStats(allMovies);
            randomMovies = await getRandomRelevantMovies();
        }

        res.render('index', {
            allMovies: allMovies,
            randomMovies: randomMovies,
            pageTitle: pageTitle,
            pageSubtitle: pageSubtitle,
            selectedGenre: genre,
            selectedYear: year,
            selectedSort: sort,
            showFilters: req.query.showFilters === 'true'
        });
    } catch (err) {
        console.log(err);
        res.send('Something went wrong');
    }
});


app.post('/signup',async (req,res)=>{
    const {error}=signupschema.validate(req.body)
    if(error){
        return res.render('signup',{
        error:error.details[0].message,
        old:req.body
    })
    }
    try{
    const hpass= await bcrypt.hash(req.body.password,10);

    await User.create({
        username:req.body.username,
        email:req.body.email,
        password:hpass
    })
    res.redirect('/login')
}
catch(err){
    console.log('Signup error:', err);
    let errorMsg = 'Signup failed. Please try again.';
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];
        if (field === 'email') errorMsg = 'This email is already registered. Try logging in.';
        else if (field === 'username') errorMsg = 'This username is already taken.';
        else errorMsg = 'Account already exists.';
    }
    res.render('signup', {
            error: errorMsg,
            old: req.body
        });
}
    
})

app.post('/login',async(req,res)=>{
    const {error}=loginschema.validate(req.body)
    if(error){
        return res.render('login',{
            error:error.details[0].message,
            old:req.body
        });

    }
    try{
    const user=await User.findOne({
        email:req.body.email
    })
    if(!user){
        return res.render('login',{
    error:'Invalid Email',
    old:req.body})
    }
    const valid=await bcrypt.compare(req.body.password,user.password);
    if(!valid){
        return res.render('login',{
    error:'Incorrect Password',
    old:req.body
})
    }
    req.session.userId=user._id;
    res.redirect('/');
}
catch(err){
    console.log(err);
    res.render('login', {
            error: 'Login failed',
            old: req.body
        });
}
})

function isloggedin(req,res,next){
    if(!req.session.userId){
        return res.redirect('/login');
    }
    next();
}
app.get('/movie/:id',isloggedin,async(req,res)=>{
    try{
        const response=await axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}`,{
            params:{
                api_key:process.env.TMDB_API_KEY
            }
    })
    const watchlistMovie= await Watchlist.findOne({
        userId:req.session.userId,
        tmdbId:Number(req.params.id),
        mediaType:'movie'
    })
        const movie=response.data;
        const reviews=await Review.find({
            tmdbId:Number(req.params.id),
            mediaType:'movie'
        }).populate('userId');
        const userReview = await Review.findOne({
            userId: req.session.userId,
            tmdbId: Number(req.params.id),
            mediaType:'movie'
        });
        res.render('show',{
            movie,
            reviews,
            userReview,
            watchlistMovie
        });
    }
    catch(err){
        console.log(err);
        res.send("Movie not found")
    }
})
app.post('/movie/:id/review',isloggedin,async(req,res)=>{
    try{
        const existingreview=await Review.findOne({
            userId:req.session.userId,
            tmdbId:Number(req.params.id),
            mediaType:'movie'
        });
        if(existingreview){
            existingreview.rating=req.body.rating;
            existingreview.comment=req.body.comment;
            await existingreview.save();
        }
        else{
            await Review.create({
                userId:req.session.userId,
                tmdbId:Number(req.params.id),
                rating:req.body.rating,
                comment:req.body.comment,
                mediaType:'movie'
            })
        }
        res.redirect('/movie/' + req.params.id);
    }
    catch(err){
        console.log(err);
        res.send('Could not save review');
    }
})
app.get('/watchlist',isloggedin,async(req,res)=>{
    try{
        const movies=await watchlist.find({
            userId:req.session.userId
        })
        res.render('watchlist',{movies})
    }
    catch(err){
        console.log(err);
        res.send("Could not load watchlist")
    }
})
app.post('/watchlist/add',isloggedin, async(req,res)=>{
    try{
        const{tmdbId,title,posterPath,status,mediaType}=req.body
        const resolvedMediaType = mediaType || 'movie';
        const existing=await Watchlist.findOne({
            userId:req.session.userId,
            tmdbId:Number(tmdbId),
            mediaType:resolvedMediaType
        })
        if(existing){
            existing.status=status;
            await existing.save()
        }
        else{
            await Watchlist.create({
                userId:req.session.userId,
                tmdbId:Number(tmdbId),
                title,
                posterPath,
                status,
                mediaType:resolvedMediaType
            })
        }
        const referer = req.get('referer') || '';
        if (referer.includes('/watchlist')) {
            res.redirect('/watchlist');
        } else if (resolvedMediaType === 'tv') {
            res.redirect('/series/'+tmdbId);
        } else {
            res.redirect('/movie/'+tmdbId);
        }
    }
    catch(err){
        console.log(err);
        res.send('Could not update watchlist')
    }
})

app.post('/watchlist/remove/:id',isloggedin,async(req,res)=>{
    try{
        await Watchlist.findByIdAndDelete(req.params.id);
        res.redirect('/watchlist')
    }
    catch(err){
        console.log(err);
        res.send('could not remove from watchlist')
    }
})
app.get('/trending',async (req,res)=>{
    try{
        const response=await axios.get('https://api.themoviedb.org/3/trending/movie/week',{
            params:{api_key:process.env.TMDB_API_KEY}
        });
        const allMovies=response.data.results;

        await addReviewStats(allMovies, 'movie');
        res.render('index',{
            allMovies,
            pageTitle:"Trending Movies",
            pageSubtitle:"Trending on Wysteria"
        })
    }
    catch(err){
        console.log(err)
        res.send('Somehting went wrong')
    }
})
app.get('/login', (req, res) => {
    res.render('login',{
        error:null,
        old:{}
    });
});
app.get('/watch/:id',isloggedin,async (req,res)=>{
    try{
        const response=await axios.get(`https://api.themoviedb.org/3/movie/${req.params.id}`,{params:{api_key:process.env.TMDB_API_KEY}})
        const movie=response.data;
        const providers = StreamingProviderManager.getProviders(movie.id, 'movie');
        res.render('watch',{movie, providers});
    }
    catch(err){
        console.log(err)
        res.send('Cannot play movie')
    }
})
app.get('/signup', (req, res) => {
    res.render('signup',{
        error:null,
        old:{}
    });
});
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})
app.get('/series', isloggedin, async (req, res)=> {
    try {
        const search = req.query.q;
        const genre = req.query.genre || '';
        const year = req.query.year || '';
        const sort = req.query.sort || 'popularity.desc';

        let allSeries=[];
        let randomSeries=[];
        let pageTitle = 'Browse TV Series';
        let pageSubtitle = 'Track shows, write thoughts, and stream episodes.';

        if (search) {
            const response = await axios.get(
                'https://api.themoviedb.org/3/search/tv', {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    query: search,
                    first_air_date_year: year || undefined
                }
            });
            allSeries = response.data.results || [];
            await addReviewStats(allSeries, 'tv');
            pageTitle = 'Search results for "' + search + '"';
            pageSubtitle = allSeries.length + ' TV shows found';
        } else if (genre || year || sort !== 'popularity.desc') {
            const response = await axios.get(
                'https://api.themoviedb.org/3/discover/tv', {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    with_genres: genre || undefined,
                    first_air_date_year: year || undefined,
                    sort_by: sort
                }
            });
            allSeries = response.data.results || [];
            await addReviewStats(allSeries, 'tv');
            pageTitle = 'Filtered TV Series';
            pageSubtitle = allSeries.length + ' TV shows matched your criteria';
        } else {
            const response = await axios.get(
                'https://api.themoviedb.org/3/tv/popular',
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY
                    }
                }
            );
            allSeries = response.data.results || [];
            await addReviewStats(allSeries, 'tv');
            randomSeries = await getRandomRelevantSeries();
        }

        res.render('series', {
            allSeries: allSeries,
            randomSeries: randomSeries,
            pageTitle: pageTitle,
            pageSubtitle: pageSubtitle,
            selectedGenre: genre,
            selectedYear: year,
            selectedSort: sort,
            showFilters: req.query.showFilters === 'true'
        });
    } catch (err) {
        console.log(err);
        res.send('Something went wrong');
    }
});

app.get('/series/:id', isloggedin, async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${req.params.id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY
            }
        });
        const watchlistMovie = await Watchlist.findOne({
            userId: req.session.userId,
            tmdbId: Number(req.params.id),
            mediaType: 'tv'
        });
        const series = response.data;
        const reviews = await Review.find({
            tmdbId: Number(req.params.id),
            mediaType: 'tv'
        }).populate('userId');
        const userReview = await Review.findOne({
            userId: req.session.userId,
            tmdbId: Number(req.params.id),
            mediaType: 'tv'
        });
        res.render('show_series', {
            series,
            reviews,
            userReview,
            watchlistMovie
        });
    } catch (err) {
        console.log(err);
        res.send("Series not found");
    }
});

app.post('/series/:id/review', isloggedin, async (req, res) => {
    try {
        const existingreview = await Review.findOne({
            userId: req.session.userId,
            tmdbId: Number(req.params.id),
            mediaType: 'tv'
        });
        if (existingreview) {
            existingreview.rating = req.body.rating;
            existingreview.comment = req.body.comment;
            await existingreview.save();
        } else {
            await Review.create({
                userId: req.session.userId,
                tmdbId: Number(req.params.id),
                rating: req.body.rating,
                comment: req.body.comment,
                mediaType: 'tv'
            });
        }
        res.redirect('/series/' + req.params.id);
    } catch (err) {
        console.log(err);
        res.send('Could not save review');
    }
});

app.get('/watch-series/:id', isloggedin, async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${req.params.id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY
            }
        });
        const series = response.data;
        const currentSeason = Number(req.query.season) || 1;
        const currentEpisode = Number(req.query.episode) || 1;
        const providers = StreamingProviderManager.getProviders(series.id, 'tv', currentSeason, currentEpisode);
        
        res.render('watch_series', {
            series,
            currentSeason,
            currentEpisode,
            providers
        });
    } catch (err) {
        console.log(err);
        res.send('Cannot play series');
    }
});
app.get('/profile', isloggedin, async (req, res) => {
    try {
        const reviewsCount = await Review.countDocuments({ userId: req.session.userId });
        const watchlistCount = await Watchlist.countDocuments({ userId: req.session.userId });
        
        res.render('profile', {
            reviewsCount,
            watchlistCount,
            pageTitle: 'My Profile'
        });
    } catch (err) {
        console.log(err);
        res.send('Could not load profile');
    }
});

app.get('/continue-watching', isloggedin, async (req, res) => {
    try {
        const progressList = await WatchProgress.find({
            userId: req.session.userId
        }).sort({ updatedAt: -1 });
        res.render('continue_watching', { movies: progressList });
    } catch (err) {
        console.log(err);
        res.send('Could not load continue watching list');
    }
});

app.post('/api/watch-progress', isloggedin, async (req, res) => {
    try {
        const { tmdbId, mediaType, title, posterPath, progress, currentTime, duration, season, episode } = req.body;
        await WatchProgress.findOneAndUpdate(
            {
                userId: req.session.userId,
                tmdbId: Number(tmdbId),
                mediaType
            },
            {
                title,
                posterPath: posterPath || '',
                progress: Number(progress) || 0,
                currentTime: Number(currentTime) || 0,
                duration: Number(duration) || 0,
                season: season ? Number(season) : null,
                episode: episode ? Number(episode) : null,
                updatedAt: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error('Error saving watch progress:', err);
        res.sendStatus(500);
    }
});

app.get('/settings', isloggedin, (req, res) => {
    res.render('settings', { error: null, success: null });
});

app.post('/settings/update-password', isloggedin, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.render('settings', { error: 'Current password does not match', success: null });
        }
        if (newPassword.length < 8) {
            return res.render('settings', { error: 'New password must be at least 8 characters long', success: null });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.render('settings', { error: null, success: 'Password updated successfully!' });
    } catch (err) {
        console.log(err);
        res.render('settings', { error: 'Failed to update password', success: null });
    }
});

if (!process.env.VERCEL) {
    app.listen(4444, function () {
        console.log('server has started on port 4444');
    });
}

module.exports = app;
