let msg = (message, statusCode = 200, data = null, error = null) => {
    return { message, statusCode, data, error }
}

module.exports = {
    msg,
}