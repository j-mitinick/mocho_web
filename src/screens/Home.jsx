import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { backend_rtc } from "../helpers/env";
import { Swiper, SwiperSlide } from 'swiper/react';

export const Home = ()=>{

    const [feed,setFeed] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categories,setCategories] = useState([
        {
            name:"Geral",
            selected:true
        },
        {
            name:"Comunicação Interna",
            selected:false
        },
        {
            name:"Despacho",
            selected:false
        },
        {
            name:"Comunicação externa",
            selected:false
        }
    ])


    const loadFeed = ()=>{
        fetch(`${backend_rtc}/load_feed`, {
              method: 'GET',
          })
          .then(function(response){ 
          return response.json()})
          .then(function(data){
            setFeed(data.response)
          })
          .catch(error => alert('Error:', error)); 
      }

    useEffect(()=>{
       loadFeed();
    },[])

    const handleOnSearch = (e)=>{
        setSearchQuery(e.target.value)
    }

    const onSelectedCategorie = (category)=>{
        const newStateCategories = categories.map(c=>{
            if(c.name == category){
                return {
                    ...c,selected:true
                }
            }

            return {
                ...c,selected:false
            }
        });

        setSearchQuery(category);
        setCategories(newStateCategories)
      }



      const filteredEvents =
      searchQuery === "" || searchQuery == "Geral"
        ? feed
        : feed.filter((news) => news.category.toLowerCase() == searchQuery.toLowerCase());

    return (
        <AppLayout searchBarPlaceHolder="Buscar notícias" showSearchBar onSearch={handleOnSearch}>
            <div className="grid overflow-hidden items-start mt-10 2xl:pt-16 pt-2 mx-4">
                <div className="flex flex-row justify-center justify-self-center mt-4 py-2 gap-3 flex-wrap  w-3/4 rounded-tl-md rounded-tr-md bg-white">                
                    {
                        categories.map(({name,selected})=><button onClick={()=>onSelectedCategorie(name)}  key={name} className={`p-1 rounded-md ${selected==true ? 'text-white bg-primary':'bg-white text-yellow-600'}`}>{name}</button>)
                    }
                </div>
                <Swiper
                    spaceBetween={50}
                    pagination
                    navigation
                    slidesPerView={1}
                    onSlideChange={() => console.log('slide change')}
                    onSwiper={(swiper) => console.log(swiper)}
                    autoplay
                    className="2xl:h-[60%] h-[90%] w-3/4"
                >
                    {filteredEvents.map(({createdAt,description,url_external_link,event,id,midia,midia_type})=><SwiperSlide 
                    key={id}
                    >
                        <div className="h-full w-full rounded-bl-md rounded-br-md relative overflow-hidden">
                            {url_external_link &&
                                <a href={url_external_link} target="_blank" rel="noopener noreferrer">
                                    {midia_type == 1 && <img src={midia} className="h-full w-full object-cover" />}
                                    <p className="absolute bottom-8 right-3 bg-white bg-opacity-60 p-2 rounded-md">{event}</p>
                                </a>
                            }

                            {!url_external_link &&
                                <>
                                    {midia_type == 1 && <img src={midia} className="h-full w-full object-cover" />}
                                    <p className="absolute bottom-8 right-3 bg-white bg-opacity-60 p-2 rounded-md">{event}</p>
                                </>
                            }
                        </div>
                    </SwiperSlide>)}
                </Swiper>
            </div>
            
        </AppLayout>
    )
}