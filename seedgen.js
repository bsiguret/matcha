'use strict'

require('dotenv').config();
const db = require('mysql');
const faker = require('faker/locale/en_US');
const bcrypt = require('bcrypt');
const fs = require('fs')
const axios = require('axios')
const genderPkg = require('gender');

const lastCon = Date.now()

const mysql = db.createConnection({
    host     : process.env.HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : 'matcha'
})

const mystorage = __dirname + "/front-end/public/uploads/"

const randomIntBetween = (min,max,except = null) => {
  let randomInt = Math.floor(Math.random() * (max - min + 1)) + min
  randomInt = (except == randomInt) ? (Math.floor(Math.random() * ((except - 1) - min + 1)) + min) : randomInt
  return randomInt
}

const randomCoord = (min, max = null, minFloat, maxFloat) => {
  if (max) {
    return parseFloat(randomIntBetween(min,max) + "." + randomIntBetween(minFloat,maxFloat))
  } else {
    return parseFloat(min + "." + randomIntBetween(minFloat,maxFloat))
  }
}

const getURIs = (cb) => {
  console.log('Get photos from unsplash.com ...')
  axios.get('https://api.unsplash.com/photos/random', {
    params: {
      query: 'woman',
      w: 250,
      h: 250,
      count: 30,
      // orientation: 'portrait',
      client_id: '8ef7cc2d9ad5cb75aa08c5f09ccaac054e6ef0d6696e1b13921bc5439cae6891'
    }
  }).then(async woman => {
    let URIs = {}
    URIs.woman = [], URIs.man = []

    await woman.data.forEach(elem => {
      URIs.woman.push(elem.urls.custom)
    });

    axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: 'man',
        w: 250,
        h: 250,
        count: 30,
        // orientation: 'portrait',
        client_id: '8ef7cc2d9ad5cb75aa08c5f09ccaac054e6ef0d6696e1b13921bc5439cae6891'
      }
    }).then(async man => {

      await man.data.forEach(elem => {
        URIs.man.push(elem.urls.custom)
      });

      cb(URIs, null)
    }).catch(e => { console.log("[MAN]",e);cb(null, e) })
  }).catch(e => { console.log("[WOMAN]",e);cb(null, e) })
}

const addTags = async () => {
  let tags = ['#motivation', '#tatoo', '#photographer',
              '#fitness','#healthy','#series','#movies',
              '#trip', '#foodporn', '#dance', '#animals',
              '#social', '#musician', '#lifestyle', '#love',
              '#couplegoal', '#friendwithbenefits', '#sidechick']


  let insertTag = (tag) => {
    const sql = 'INSERT INTO Tag (tagname) VALUES (?)'
    return new Promise((resolve, reject) => {
      return mysql.query(sql, [tag], (err, success) => {
          (err) ? reject(err) : resolve(success)
      })
    })
  }

  let tagPromise = tags.map(elem => {
    return insertTag(elem)
  })

  await Promise.all(tagPromise)
  return tags
}

const downloadImg = (username, link, idx) => {
  return new Promise((resolve, reject) => {
    axios({ method:'get', url: link, responseType:'stream' }).then(async res => {
      let name = 'photo-0' + idx + '.png'
      let file = mystorage+username+"/"+name
      let filedb = 'front-end/public/uploads/' + username + '/' + name
      await res.data.pipe(fs.createWriteStream(file))
      resolve(filedb)
    }).catch(e => {console.log("[IMG]",e);reject(e)})
  })
}

const getImgFromUh = async (username, gender, links) => {
  let idx = 0, np = randomIntBetween(1,5), toDl = []
  links = (gender == 'Women') ? links.woman : links.man

  while (idx < np) {
      let img = Math.round(Math.random()*(links.length-1))
      toDl.push(links[img])
      idx++
  }

  fs.mkdirSync(mystorage + username)
  let paths = toDl.map((elem, idx) => {
    return downloadImg(username, elem, idx)
  })
  
  paths = await Promise.all(paths)
  return paths
}

const createUser = async (idx) => {
  const password = await bcrypt.hash('Rootroot42', 10)
  const orientation = ['Straight', 'Gay', 'Bisexual']
  //const gender = ['Other', 'Man', 'Women']
  let seed = {
    firstname: faker.name.firstName().toLowerCase(),
    lastname: faker.name.lastName().toLowerCase(),
    username: faker.internet.userName().toLowerCase()+idx,
    lastCon: lastCon,
    birthdate: (faker.date.between('2000-10-11','1985-10-11').toJSON()).toString(),
    gender: null, //gender[Math.floor(Math.random()*gender.length)],
    email: idx+faker.internet.email().toLowerCase(),
    password: password,
    orientation: orientation[Math.floor(Math.random()*orientation.length)],
    bio: faker.lorem.sentence(),
    score: 0,
    address: faker.address.streetAddress().toLowerCase(),
    latitude: randomCoord(48, false, 812055, 903896),//randomCoord(48,49,100000,300000), //faker.address.latitude(),
    longitude: randomCoord(2, false, 258877, 419218),//randomCoord(1,3,100000,850000),//faker.address.longitude(),
    isVerified: 1,
    isCompleted: 1,
  }
  let gender = await genderPkg.guess(seed.firstname).gender
  if (gender === 'male') seed.gender = 'Man'
  if (gender === 'female') seed.gender = 'Women'
  if (gender === 'unknown') seed.gender = (seed.username.length % 2) ? 'Man' : 'Women'

  let insertUser = (user) => {
    let data = [user.firstname, user.lastname, user.username, user.lastCon, user.birthdate,
                user.gender, user.email, user.password, user.orientation,
                user.bio, user.address, user.latitude, user.longitude,
                user.isVerified, user.isCompleted]
    const sql = 'INSERT INTO User (firstname, lastname, username, lastCon, birthdate, gender, email, password, orientation, bio, address, latitude, longitude, isVerified, isCompleted) VALUES (?, ?, ?, TIMESTAMP(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    return new Promise((resolve, reject) => {
      return mysql.query(sql, data, (err, success) => {
          (err) ? reject(err) : resolve(user)
      })
    })
  }
  
  await insertUser(seed)
  return seed
}

const addPhoto = async (userid, paths) => {
  let insertPhoto = (path, idx) => {
    const sql = 'INSERT INTO Photo (userid, srcimg, profile) VALUES (?, ?, ?)'
    return new Promise((resolve, reject) => {
        let profile = (!idx) ? 1 : null
        return mysql.query(sql, [userid, path, profile], (err, success) => {
            (err) ? reject(err) : resolve(success)
        })
    })
  }

  let photoPromise = paths.map((elem, idx) => {
    return insertPhoto(elem, idx)
  })

  await Promise.all(photoPromise)
  return null
}

const addKeys = async (userid) => {
  let idx = 0, nt = randomIntBetween(1,5), toIns = []

  while (idx < nt) {
    let tag = randomIntBetween(1,18)
    toIns.push(tag)
    idx++
  }

  let insertKey = (userid, key) => {
    const sql = 'INSERT INTO Usertag (userid,tagid) VALUES (?,?)'

    return new Promise((resolve, reject) => {
      return mysql.query(sql, [userid, key], (err,success) => {
        (err) ? reject(err) : resolve(success)
      })
    })
  }

  let keyPromise = toIns.map(elem => {
    return insertKey(userid, elem)
  })

  await Promise.all(keyPromise)
  return toIns
}

const addPopularity = async (userid, seeders) => {
  let insertPop = (userid, seenbyid, love, seenTime, loveTime) => {
    const userData = [userid, seenbyid, love, seenTime, loveTime]
    const sql = 'INSERT INTO Popularity (userid, seenbyid, love, seenTime, loveTime) VALUES (?, ?, ?, TIMESTAMP(?), TIMESTAMP(?))'
    return new Promise((resolve, reject) => {
        return mysql.query(sql, userData, (err, success) => {
            (err) ? reject(err) : resolve(success)
        })
    })
  }

  if (userid > 2) {
    let now = Date.now()
    let seenbyid = userid //randomIntBetween(1, userid - 1)
    userid = randomIntBetween(1, seeders, userid)
    let seenTime = now
    let love = (((userid / 3) % 1) != 0) === false ? 0 : 1 
    let loveTime = love ? now : 0

    await insertPop(userid, seenbyid, love, seenTime, loveTime)
  }

  return null
}

const upScore = async (userid) => {
  let getSumLove = (userid) => {
    const sql = 'SELECT SUM(love) AS Score FROM Popularity WHERE userid = ? '
    return new Promise((resolve, reject) => {
      return mysql.query(sql, [userid], (err, sum) => {
          if (err) reject(err)
          if (!sum[0]) { resolve(0) }
          else { resolve(sum[0].Score) }
      })
    })
  }

  let updateScore = (score, userid) => {
    score = parseInt(score) * 2
    const sql = 'UPDATE User SET score ='+ score +' WHERE id = ?'
    return new Promise((resolve, reject) => {
      return mysql.query(sql, [userid], (err, updated) => {
          (err) ? reject(err) : resolve(updated)
      })
    })
  }

  let score = await getSumLove(userid)
  if (score) {
    await updateScore(score, userid)
  }
  return null
}

let seeders = parseInt(process.argv[2])
//Starts here !
if (seeders) {
  seeders = (seeders < 10 || seeders > 1000) ? 10 : seeders
  getURIs(async (links, err) => {
    if (err) { return console.error(err) }
    let idx = 0
  
    mysql.connect()
    await addTags()
  
    while (idx < seeders) {
      let user = {}, paths = []
      user = await createUser(idx+1)
      paths = await getImgFromUh(user.username, user.gender, links)
      await addPhoto(idx + 1, paths)
      await addKeys(idx + 1)
      await addPopularity(idx + 1, seeders)
      process.stdout.write('('+ (idx+1) +'/'+ seeders +') Users created\r')
      idx++
    }
    console.log('\nPopularity creation ...')
    idx = 0
    while (idx < seeders) {
        await upScore(idx + 1)
        idx++
    }
    console.log('Finished !')
    mysql.destroy()
  })
} else {
  console.log('Usage: node seedgen n_fake')
}
