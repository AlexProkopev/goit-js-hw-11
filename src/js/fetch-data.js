import { BASE_URL, key } from './http';
import axios from 'axios';


export async function fetchData(value,page) {
  const options = {
    params: {
      key,
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  };

  
  try {
    const response = await axios.get(BASE_URL, options);
    return response.data
  } catch (error) {
    throw new Error("Произошла ошибка")
  }
  
}
