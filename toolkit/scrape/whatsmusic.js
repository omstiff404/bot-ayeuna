const axios = require('axios')

async function whatsmusic(audioBuffer, termaiWeb, termaiKey) {
  try {
    const response = await axios.post(`${termaiWeb}/api/audioProcessing/whatmusic?key=${termaiKey}`, audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    })

    if (response.data?.status === 'success' && response.data.details?.status) {
      const { title, artists, acrid } = response.data.details.data
      return { success: true, title, artists, acrid }
    } else {
      return { success: false, message: 'Lagu tidak dikenali.' }
    }

  } catch (error) {
    return { success: false, message: 'Gagal request: ' + error.message }
  }
}

module.exports = { whatsmusic }