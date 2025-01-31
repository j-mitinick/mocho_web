import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { register } from 'swiper/element/bundle';
import 'swiper/css';
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

register();


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>    
  </React.StrictMode>,
)
