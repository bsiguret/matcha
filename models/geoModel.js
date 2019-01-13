'use strict'

const nodeGeocoder = require('node-geocoder');
const options = {
    provider: 'opencage',
    httpAdapter: 'https',
    apiKey: '402032aedd4842589e1d4032bdd3fe08',//process.env.API_KEY_OPENCAGE,
    formatter: 'json',
};

module.exports = {
    addrToCoord : (address) => {
        let geocoder = nodeGeocoder(options)

        return new Promise((resolve, reject) => {
            geocoder.geocode(address).then((res) => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    },

    coordToAddr : (coord) => {
        let geocoder = nodeGeocoder(options)
        return new Promise ((resolve, reject) => {
            geocoder.reverse(coord).then(res => {
                resolve(res[0].city)
            }).catch(err => {
                reject(err)
            })
        })
    }
}