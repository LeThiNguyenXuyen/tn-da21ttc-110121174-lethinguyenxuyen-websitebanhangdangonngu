import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import Product from '../../components/Product/Product'

const Home = () => {

   const [category,setCategory] = useState("All");


  return (
    <div>
      <Header/>
      <Product category={category}/>
    </div>
  )
}

export default Home
