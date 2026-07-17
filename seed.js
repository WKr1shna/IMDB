const mongoose=require('mongoose');
const Movie= require('./models/movies');




const dummyReviewUsers = [
  "seed-user-1",
  "seed-user-2",
  "seed-user-3",
  "seed-user-4",
  "seed-user-5",
  "seed-user-6"
];

const dummyComments = [
  "Loved the pacing and performances.",
  "A strong rewatch with memorable scenes.",
  "Great visuals and a story that sticks.",
  "Really enjoyable, especially the final act.",
  "A classic for a reason.",
  "Solid movie night pick."
];

const posterUrls = {
  "Inception": "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg",
  "The Dark Knight": "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg",
  "Interstellar": "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
  "Titanic": "https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png",
  "Avatar": "https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg",
  "The Matrix": "https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png",
  "Gladiator": "https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png",
  "Jurassic Park": "https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg",
  "Avengers: Endgame": "https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg",
  "Forrest Gump": "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg",
  "The Shawshank Redemption": "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg",
  "The Godfather": "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg",
  "Pulp Fiction": "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
  "Fight Club": "https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg",
  "The Lord of the Rings: The Fellowship of the Ring": "https://upload.wikimedia.org/wikipedia/en/f/fb/Lord_Rings_Fellowship_Ring.jpg",
  "The Social Network": "https://upload.wikimedia.org/wikipedia/en/8/8c/The_Social_Network_film_poster.png",
  "La La Land": "https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png",
  "Parasite": "https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png",
  "Whiplash": "https://upload.wikimedia.org/wikipedia/en/0/01/Whiplash_poster.jpg",
  "Spider-Man: Into the Spider-Verse": "https://upload.wikimedia.org/wikipedia/en/f/fa/Spider-Man_Into_the_Spider-Verse_poster.png",
  "Dune": "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg",
  "Oppenheimer": "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
  "Barbie": "https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg",
  "Top Gun: Maverick": "https://upload.wikimedia.org/wikipedia/en/1/13/Top_Gun_Maverick_Poster.jpg",
  "Everything Everywhere All at Once": "https://upload.wikimedia.org/wikipedia/en/1/1e/Everything_Everywhere_All_at_Once.jpg",
  "Mad Max: Fury Road": "https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg",
  "Black Panther": "https://upload.wikimedia.org/wikipedia/en/d/d6/Black_Panther_%28film%29_poster.jpg",
  "Coco": "https://upload.wikimedia.org/wikipedia/en/9/98/Coco_%282017_film%29_poster.jpg",
  "The Grand Budapest Hotel": "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Grand_Budapest_Hotel.png",
  "Knives Out": "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Knives_Out_poster.jpeg/250px-Knives_Out_poster.jpeg",
  "Get Out": "https://upload.wikimedia.org/wikipedia/en/a/a3/Get_Out_poster.png",
  "The Batman": "https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg",
  "The Silence of the Lambs": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Silence_of_the_Lambs_poster.jpg",
  "Goodfellas": "https://en.wikipedia.org/wiki/Special:Redirect/file/Goodfellas.jpg",
  "Se7en": "https://en.wikipedia.org/wiki/Special:Redirect/file/Seven_%28movie%29_poster.jpg",
  "The Departed": "https://en.wikipedia.org/wiki/Special:Redirect/file/Departed234.jpg",
  "Saving Private Ryan": "https://en.wikipedia.org/wiki/Special:Redirect/file/Saving_Private_Ryan_poster.jpg",
  "Braveheart": "https://en.wikipedia.org/wiki/Special:Redirect/file/Braveheart_imp.jpg",
  "The Green Mile": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Green_Mile_%28movie_poster%29.jpg",
  "The Prestige": "https://en.wikipedia.org/wiki/Special:Redirect/file/Prestige_poster.jpg",
  "Memento": "https://en.wikipedia.org/wiki/Special:Redirect/file/Memento_poster.jpg",
  "Django Unchained": "https://en.wikipedia.org/wiki/Special:Redirect/file/Django_Unchained_Poster.jpg",
  "Inglourious Basterds": "https://en.wikipedia.org/wiki/Special:Redirect/file/Inglourious_Basterds_poster.jpg",
  "The Wolf of Wall Street": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Wolf_of_Wall_Street_%282013%29.png",
  "Joker": "https://en.wikipedia.org/wiki/Special:Redirect/file/Joker_%282019_film%29_poster.jpg",
  "Logan": "https://en.wikipedia.org/wiki/Special:Redirect/file/Logan_2017_poster.jpg",
  "Deadpool": "https://en.wikipedia.org/wiki/Special:Redirect/file/Deadpool_poster.jpg",
  "Guardians of the Galaxy": "https://en.wikipedia.org/wiki/Special:Redirect/file/Guardians_of_the_Galaxy_poster.jpg",
  "Iron Man": "https://en.wikipedia.org/wiki/Special:Redirect/file/Iron_Man_%282008_film%29_poster.jpg",
  "Doctor Strange": "https://en.wikipedia.org/wiki/Special:Redirect/file/Doctor_Strange_poster.jpg",
  "Thor: Ragnarok": "https://en.wikipedia.org/wiki/Special:Redirect/file/Thor_Ragnarok_poster.jpg",
  "Captain America: The Winter Soldier": "https://en.wikipedia.org/wiki/Special:Redirect/file/Captain_America_The_Winter_Soldier_poster.jpg",
  "Star Wars": "https://en.wikipedia.org/wiki/Special:Redirect/file/Star_Wars_%281977_film%29_poster.jpg",
  "The Empire Strikes Back": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Empire_Strikes_Back_%281980_film%29.jpg",
  "Return of the Jedi": "https://en.wikipedia.org/wiki/Special:Redirect/file/Return_of_the_Jedi_poster.jpg",
  "Raiders of the Lost Ark": "https://en.wikipedia.org/wiki/Special:Redirect/file/Raiders_of_the_Lost_Ark_Theatrical_Poster.jpg",
  "Indiana Jones and the Last Crusade": "https://en.wikipedia.org/wiki/Special:Redirect/file/Indiana_Jones_and_the_Last_Crusade.png",
  "Back to the Future": "https://en.wikipedia.org/wiki/Special:Redirect/file/Back_to_the_Future.jpg",
  "E.T. the Extra-Terrestrial": "https://en.wikipedia.org/wiki/Special:Redirect/file/E.T._the_Extra-Terrestrial.jpg",
  "Jaws": "https://en.wikipedia.org/wiki/Special:Redirect/file/Jaws_movie_poster.jpg",
  "The Terminator": "https://en.wikipedia.org/wiki/Special:Redirect/file/Terminator1984movieposter.jpg",
  "Terminator 2: Judgment Day": "https://en.wikipedia.org/wiki/Special:Redirect/file/Terminator2poster.jpg",
  "Alien": "https://en.wikipedia.org/wiki/Special:Redirect/file/Alien_movie_poster.jpg",
  "Aliens": "https://en.wikipedia.org/wiki/Special:Redirect/file/Aliens_poster.jpg",
  "Blade Runner": "https://en.wikipedia.org/wiki/Special:Redirect/file/Blade_Runner_poster.jpg",
  "Blade Runner 2049": "https://en.wikipedia.org/wiki/Special:Redirect/file/Blade_Runner_2049_poster.png",
  "Arrival": "https://en.wikipedia.org/wiki/Special:Redirect/file/Arrival%2C_Movie_Poster.jpg",
  "Gravity": "https://en.wikipedia.org/wiki/Special:Redirect/file/Gravity_Poster.jpg",
  "The Martian": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Martian_film_poster.jpg",
  "Her": "https://en.wikipedia.org/wiki/Special:Redirect/file/Her2013Poster.jpg",
  "Ex Machina": "https://en.wikipedia.org/wiki/Special:Redirect/file/Ex_Machina_%28film%29.png",
  "No Country for Old Men": "https://en.wikipedia.org/wiki/Special:Redirect/file/No_Country_for_Old_Men_poster.jpg",
  "There Will Be Blood": "https://en.wikipedia.org/wiki/Special:Redirect/file/There_Will_Be_Blood_Poster.jpg",
  "The Revenant": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Revenant_2015_film_poster.jpg",
  "Birdman": "https://en.wikipedia.org/wiki/Special:Redirect/file/Birdman_poster.png",
  "12 Years a Slave": "https://en.wikipedia.org/wiki/Special:Redirect/file/12_Years_a_Slave_film_poster.jpg",
  "The Imitation Game": "https://en.wikipedia.org/wiki/Special:Redirect/file/The_Imitation_Game_%282014%29.png",
  "A Beautiful Mind": "https://en.wikipedia.org/wiki/Special:Redirect/file/A_Beautiful_Mind_Poster.jpg",
  "Slumdog Millionaire": "https://en.wikipedia.org/wiki/Special:Redirect/file/Slumdog_Millionaire_poster.png",
  "Life of Pi": "https://en.wikipedia.org/wiki/Special:Redirect/file/Life_of_Pi_2012_Poster.jpg",
  "The Truman Show": "https://en.wikipedia.org/wiki/Special:Redirect/file/TheTrumanShow.jpg",
  "Eternal Sunshine of the Spotless Mind": "https://en.wikipedia.org/wiki/Special:Redirect/file/Eternal_Sunshine_of_the_Spotless_Mind.png"
};

function posterUrl(name) {
  return posterUrls[name];
}

function movieWithReviews(movie, ratings) {
  const reviews = ratings.map((rating, index) => ({
    userId: dummyReviewUsers[index],
    rating,
    comment: dummyComments[index]
  }));
  const rating = ratings.reduce((total, currentRating) => total + currentRating, 0) / ratings.length;

  return {
    ...movie,
    img: posterUrl(movie.name) || movie.img,
    reviews,
    rating,
    numReviews: reviews.length
  };
}

const dummyMovie = [
  movieWithReviews({
    name: "Inception",
    year: 2010,
    img: "https://imgs.search.brave.com/bVi0tBcPhTarsrHHX7wig4yFVF8yiuRaNlhQSdCbwbc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/Y3JpdGljc2luYy5j/b20vcGhvdG9zL21v/dmllcG9zdGVycy9p/L2luY2VwdGlvbi5q/cGc",
    desc: "A thief who steals corporate secrets through dream-sharing technology is given an inverse task of planting an idea."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "The Dark Knight",
    year: 2008,
    img: "https://imgs.search.brave.com/C5HaGP8D88lVmbmePCTnBMkFP3NglpLoOZjIAv7E6yI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk0yRTBaR0l5/TjJNdFpUQTVNaTAw/WVRaakxUazNaalF0/WVRWbE1USmlOV1V6/TWpFNFhrRXlYa0Zx/Y0djQC5qcGc",
    desc: "Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos."
  }, [5, 5, 5, 4, 5, 5]),
  movieWithReviews({
    name: "Interstellar",
    year: 2014,
    img: "https://imgs.search.brave.com/1JQ192G6NpPbv7eO4htbEDXeEaCyIODU7VqSIN6Ce1g/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzFhLzg2/L2YxLzFhODZmMTQx/ZTBjMGE5N2IwOGVm/ODMwZmQyNDhmNTky/LmpwZw",
    desc: "A team of explorers travel through a wormhole in space to ensure humanity's survival."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Titanic",
    year: 1997,
    img: "https://imgs.search.brave.com/alGGP89vCdb00nz5IVoPlQwM4tmCp7PB2HHoaT5aKO8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzFGZkRweU1PTkwu/anBn",
    desc: "A romance unfolds aboard the ill-fated RMS Titanic."
  }, [4, 5, 4, 4, 5, 3]),
  movieWithReviews({
    name: "Avatar",
    year: 2009,
    img: "https://m.media-amazon.com/images/I/41kTVLeW1CL._AC_.jpg",
    desc: "A paraplegic Marine is sent to Pandora and becomes torn between two worlds."
  }, [4, 4, 5, 4, 3, 4]),
  movieWithReviews({
    name: "The Matrix",
    year: 1999,
    img: "https://m.media-amazon.com/images/I/51EG732BV3L._AC_.jpg",
    desc: "A hacker discovers the true nature of reality and his role in the war against its controllers."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "Gladiator",
    year: 2000,
    img: "https://imgs.search.brave.com/y9KS24gCuli5GZsxV2p8JJ5sh5K5sdGsshNxlvIu08Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTFGYmZhU2JINEwu/anBn",
    desc: "A former Roman General sets out to exact vengeance against the corrupt emperor."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "Jurassic Park",
    year: 1993,
    img: "https://imgs.search.brave.com/mETx1HncX-Oi6hly2A7q-jY8lGiExHtEkfe5qKCs7pQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzVmL2Iw/L2IzLzVmYjBiM2Yz/ZDQzYTgzYjdjOGEy/ODAyYzliOGU4ZjIz/LmpwZw",
    desc: "During a preview tour, a theme park suffers a major power breakdown that allows dinosaurs to run loose."
  }, [5, 4, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Avengers: Endgame",
    year: 2019,
    img: "https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_SL1500_.jpg",
    desc: "The Avengers assemble once more to reverse Thanos' actions and restore balance."
  }, [4, 5, 4, 4, 5, 4]),
  movieWithReviews({
    name: "Forrest Gump",
    year: 1994,
    img: "https://imgs.search.brave.com/qKXFSenteqr259KE7KLKQ1SmKjZ-nV7BKS18nkb2Aso/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9mYXN0/bHktczMuYWxsbW92/aWUuY29tL2l2YS9t/b3ZpZS8yNzQyLzMw/MC8yNzQyLmpwZw",
    desc: "The life journey of a simple man with a big heart who influences several historical events."
  }, [5, 4, 5, 5, 4, 4]),
  movieWithReviews({
    name: "The Shawshank Redemption",
    year: 1994,
    img: "https://m.media-amazon.com/images/I/51NiGlapXlL._AC_.jpg",
    desc: "Two imprisoned men bond over years, finding hope and dignity inside a harsh prison."
  }, [5, 5, 5, 5, 4, 5]),
  movieWithReviews({
    name: "The Godfather",
    year: 1972,
    img: "https://m.media-amazon.com/images/I/41+eK8zBwQL._AC_.jpg",
    desc: "The aging patriarch of a crime dynasty transfers control of his empire to his reluctant son."
  }, [5, 5, 4, 5, 5, 5]),
  movieWithReviews({
    name: "Pulp Fiction",
    year: 1994,
    img: "https://m.media-amazon.com/images/I/71c05lTE03L._AC_SL1000_.jpg",
    desc: "Interwoven crime stories collide with sharp dialogue, violence, and dark comedy in Los Angeles."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Fight Club",
    year: 1999,
    img: "https://m.media-amazon.com/images/I/51v5ZpFyaFL._AC_.jpg",
    desc: "An office worker and a soap maker form an underground club that spirals into something larger."
  }, [4, 5, 4, 5, 4, 3]),
  movieWithReviews({
    name: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    img: "https://m.media-amazon.com/images/I/51Qvs9i5a%2BL._AC_.jpg",
    desc: "A young hobbit begins a dangerous journey to destroy a powerful ring."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "The Social Network",
    year: 2010,
    img: "https://m.media-amazon.com/images/I/51Y8Guv7Y4L._AC_.jpg",
    desc: "The founding of Facebook becomes a story of ambition, lawsuits, friendship, and betrayal."
  }, [4, 4, 5, 4, 4, 5]),
  movieWithReviews({
    name: "La La Land",
    year: 2016,
    img: "https://m.media-amazon.com/images/I/81rK6qQkHCL._AC_SL1500_.jpg",
    desc: "A pianist and an aspiring actor fall in love while chasing dreams in Los Angeles."
  }, [4, 5, 4, 4, 5, 4]),
  movieWithReviews({
    name: "Parasite",
    year: 2019,
    img: "https://m.media-amazon.com/images/I/91KArYP03YL._AC_SL1500_.jpg",
    desc: "A struggling family infiltrates a wealthy household, setting off a sharp social thriller."
  }, [5, 5, 5, 4, 5, 5]),
  movieWithReviews({
    name: "Whiplash",
    year: 2014,
    img: "https://m.media-amazon.com/images/I/51rR2L1A65L._AC_.jpg",
    desc: "A gifted drummer is pushed to extremes by a demanding instructor."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    img: "https://m.media-amazon.com/images/I/81Zc6dL6YOL._AC_SL1500_.jpg",
    desc: "Miles Morales becomes Spider-Man and joins heroes from across the multiverse."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Dune",
    year: 2021,
    desc: "A gifted young heir travels to a dangerous desert planet that holds the future of his family and people."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Oppenheimer",
    year: 2023,
    desc: "A brilliant physicist leads the Manhattan Project and faces the consequences of changing history."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "Barbie",
    year: 2023,
    desc: "Barbie leaves her perfect world for a comic and heartfelt journey through real-life expectations."
  }, [4, 4, 5, 4, 4, 5]),
  movieWithReviews({
    name: "Top Gun: Maverick",
    year: 2022,
    desc: "A veteran pilot returns to train elite graduates for a risky mission that demands everything."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Everything Everywhere All at Once",
    year: 2022,
    desc: "A laundromat owner is pulled into a multiverse adventure about family, regret, and possibility."
  }, [5, 5, 5, 4, 5, 5]),
  movieWithReviews({
    name: "Mad Max: Fury Road",
    year: 2015,
    desc: "A drifter and a rebel warrior race across a wasteland in a relentless fight for freedom."
  }, [5, 4, 5, 5, 5, 4]),
  movieWithReviews({
    name: "Black Panther",
    year: 2018,
    desc: "A new king returns to Wakanda and must decide what kind of leader his nation needs."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "Coco",
    year: 2017,
    desc: "A young musician enters the Land of the Dead and uncovers the truth behind his family story."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "The Grand Budapest Hotel",
    year: 2014,
    desc: "A concierge and his lobby boy are swept into theft, murder, and elegance between wars."
  }, [4, 5, 4, 4, 5, 4]),
  movieWithReviews({
    name: "Knives Out",
    year: 2019,
    desc: "A detective investigates a wealthy family after a famous mystery writer dies under suspicious circumstances."
  }, [4, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Get Out",
    year: 2017,
    desc: "A weekend visit turns into a sharp psychological horror story about control and deception."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "The Batman",
    year: 2022,
    desc: "Batman follows a trail of corruption and riddles through Gotham during his early years as a vigilante."
  }, [4, 5, 4, 4, 5, 4]),
  movieWithReviews({
    name: "The Silence of the Lambs",
    year: 1991,
    desc: "A young FBI trainee seeks help from an imprisoned killer to catch another serial murderer."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "Goodfellas",
    year: 1990,
    desc: "A mob associate rises through organized crime and watches the life unravel around him."
  }, [5, 5, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Se7en",
    year: 1995,
    desc: "Two detectives hunt a serial killer whose murders follow the seven deadly sins."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "The Departed",
    year: 2006,
    desc: "An undercover cop and a police mole try to expose each other inside Boston's crime world."
  }, [5, 4, 5, 4, 5, 5]),
  movieWithReviews({
    name: "Saving Private Ryan",
    year: 1998,
    desc: "A squad of soldiers crosses war-torn France to bring home a paratrooper after D-Day."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Braveheart",
    year: 1995,
    desc: "A Scottish warrior leads a rebellion against English rule after personal tragedy."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "The Green Mile",
    year: 1999,
    desc: "Death row guards encounter a gentle prisoner with a mysterious gift."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "The Prestige",
    year: 2006,
    desc: "Two rival magicians push obsession and sacrifice to dangerous extremes."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Memento",
    year: 2000,
    desc: "A man with short-term memory loss hunts for his wife's killer through fractured clues."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Django Unchained",
    year: 2012,
    desc: "A freed slave and a bounty hunter travel across the South to rescue his wife."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Inglourious Basterds",
    year: 2009,
    desc: "Allied fighters and a theater owner plot separate acts of revenge in Nazi-occupied France."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "The Wolf of Wall Street",
    year: 2013,
    desc: "A stockbroker builds an empire of excess, fraud, and unchecked ambition."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "Joker",
    year: 2019,
    desc: "A troubled performer descends into violence while Gotham ignores the cracks around him."
  }, [4, 4, 5, 4, 3, 5]),
  movieWithReviews({
    name: "Logan",
    year: 2017,
    desc: "An aging mutant protects a young girl while facing the end of his own legend."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Deadpool",
    year: 2016,
    desc: "A mercenary with accelerated healing hunts the man who ruined his life."
  }, [4, 4, 5, 4, 4, 5]),
  movieWithReviews({
    name: "Guardians of the Galaxy",
    year: 2014,
    desc: "A group of misfits becomes an unlikely team while protecting a powerful artifact."
  }, [4, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Iron Man",
    year: 2008,
    desc: "A billionaire engineer builds a powered suit and begins a new era of heroes."
  }, [5, 4, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Doctor Strange",
    year: 2016,
    desc: "A surgeon discovers mystic arts after a career-ending accident changes his life."
  }, [4, 4, 5, 4, 4, 5]),
  movieWithReviews({
    name: "Thor: Ragnarok",
    year: 2017,
    desc: "Thor races to save Asgard while trapped on a chaotic planet ruled by spectacle."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "Captain America: The Winter Soldier",
    year: 2014,
    desc: "Captain America uncovers a conspiracy while facing a ghost from his past."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Star Wars",
    year: 1977,
    desc: "A farm boy joins rebels, pilots, and mystics in a fight against an empire."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "The Empire Strikes Back",
    year: 1980,
    desc: "The rebellion scatters as Luke Skywalker trains and faces a devastating truth."
  }, [5, 5, 5, 4, 5, 5]),
  movieWithReviews({
    name: "Return of the Jedi",
    year: 1983,
    desc: "The rebels launch a final strike while Luke confronts Vader and the Emperor."
  }, [4, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Raiders of the Lost Ark",
    year: 1981,
    desc: "Indiana Jones races Nazis to find the legendary Ark of the Covenant."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Indiana Jones and the Last Crusade",
    year: 1989,
    desc: "Indiana Jones searches for his father and the Holy Grail before enemy forces can claim it."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Back to the Future",
    year: 1985,
    desc: "A teenager travels to the past and must repair his parents' future before returning home."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "E.T. the Extra-Terrestrial",
    year: 1982,
    desc: "A lonely child befriends an alien stranded on Earth and helps him find home."
  }, [4, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Jaws",
    year: 1975,
    desc: "A seaside town faces terror when a massive shark begins attacking swimmers."
  }, [5, 4, 5, 5, 4, 4]),
  movieWithReviews({
    name: "The Terminator",
    year: 1984,
    desc: "A cyborg assassin travels back in time to kill the mother of humanity's future leader."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Terminator 2: Judgment Day",
    year: 1991,
    desc: "A reprogrammed machine protects a boy from an advanced liquid-metal assassin."
  }, [5, 5, 5, 4, 5, 5]),
  movieWithReviews({
    name: "Alien",
    year: 1979,
    desc: "A space crew is hunted by a terrifying organism aboard their ship."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "Aliens",
    year: 1986,
    desc: "Ripley returns with marines to confront the creatures that destroyed her crew."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Blade Runner",
    year: 1982,
    desc: "A weary hunter tracks synthetic humans through a rain-soaked future Los Angeles."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Blade Runner 2049",
    year: 2017,
    desc: "A new blade runner uncovers a buried secret that could reshape society."
  }, [5, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Arrival",
    year: 2016,
    desc: "A linguist attempts to communicate with mysterious visitors before global panic escalates."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "Gravity",
    year: 2013,
    desc: "Two astronauts fight to survive after debris destroys their shuttle in orbit."
  }, [4, 5, 4, 4, 5, 4]),
  movieWithReviews({
    name: "The Martian",
    year: 2015,
    desc: "An astronaut stranded on Mars uses science and stubbornness to stay alive."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Her",
    year: 2013,
    desc: "A lonely writer develops a relationship with an intelligent operating system."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "Ex Machina",
    year: 2014,
    desc: "A programmer evaluates an artificial intelligence and questions who is testing whom."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "No Country for Old Men",
    year: 2007,
    desc: "A hunter, a killer, and a sheriff collide after a drug deal leaves money behind."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "There Will Be Blood",
    year: 2007,
    desc: "An oilman's ambition consumes his family, faith, and humanity."
  }, [5, 4, 5, 5, 4, 5]),
  movieWithReviews({
    name: "The Revenant",
    year: 2015,
    desc: "A frontiersman survives betrayal and brutal wilderness while seeking revenge."
  }, [4, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Birdman",
    year: 2014,
    desc: "A former superhero actor tries to revive his career with a Broadway production."
  }, [4, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "12 Years a Slave",
    year: 2013,
    desc: "A free Black man is kidnapped and sold into slavery in the American South."
  }, [5, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "The Imitation Game",
    year: 2014,
    desc: "Alan Turing and his team work to break a wartime code while hiding painful truths."
  }, [4, 5, 4, 4, 5, 4]),
  movieWithReviews({
    name: "A Beautiful Mind",
    year: 2001,
    desc: "A brilliant mathematician struggles with mental illness while pursuing groundbreaking work."
  }, [4, 5, 4, 5, 4, 5]),
  movieWithReviews({
    name: "Slumdog Millionaire",
    year: 2008,
    desc: "A young man from Mumbai's slums answers impossible quiz questions through memories of his life."
  }, [4, 5, 4, 5, 4, 4]),
  movieWithReviews({
    name: "Life of Pi",
    year: 2012,
    desc: "A shipwrecked teenager survives at sea with a Bengal tiger and an extraordinary story."
  }, [4, 5, 4, 5, 5, 4]),
  movieWithReviews({
    name: "The Truman Show",
    year: 1998,
    desc: "A man slowly discovers that his entire life has been staged for television."
  }, [5, 4, 5, 4, 5, 4]),
  movieWithReviews({
    name: "Eternal Sunshine of the Spotless Mind",
    year: 2004,
    desc: "Two former lovers erase each other from memory and rediscover what remains."
  }, [5, 5, 4, 5, 4, 5])
]


async function seed() {
    try {
        await Movie.deleteMany({});
        await Movie.insertMany(dummyMovie);
        console.log("data seeded");
    } catch (err) {
        console.log(err);
    }
}

if (require.main === module) {
    mongoose.connect('mongodb://127.0.0.1:27017/Movies')
    .then(seed)
    .then(() => mongoose.connection.close())
    .catch((err) => {
        console.log(err);
        mongoose.connection.close();
    });
}

module.exports = seed;
