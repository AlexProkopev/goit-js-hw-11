
import { BASE_URL,key } from "./http";
import axios from "axios";
import { currentValue } from "./index";






export async function fetchData() {
  
  const options = {
    params: {
      key,
      q: currentValue,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: true,
      page: 1,
      per_page: 40
    }
  }

  const response = await axios.get(BASE_URL, options)
  
  return response
}


