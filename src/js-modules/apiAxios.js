import axios from 'axios';

const API_KEY = '34995439-5563962743166d9188b527df0';
const URL = 'https://pixabay.com/api/';

export async function fetchPhoto(value, numberPage = 1) {
  const config = {
    params: {
      key: API_KEY,
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: numberPage,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(URL, config);

    return response;
  } catch (error) {
    console.error(error.message);
  }
}
