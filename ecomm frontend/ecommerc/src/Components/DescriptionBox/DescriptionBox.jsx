import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
            <div className='descriptionbox-description'>
                <p>
                An e-commerce website is an online platform where businesses showcase and sell products or services.
                 It includes features such as a product catalog, shopping cart, secure checkout, user accounts, and responsive design.
                  Essential components also involve security measures, order processing, customer support, and marketing functionalities.
                   Popular platforms include Shopify, WooCommerce, and Magento, with custom-built solutions using technologies like React and Node.js. 
                   Success in e-commerce requires a focus on user experience, security, and continuous improvement based on customer feedback and market trends.
                </p>
                <p>
                E-commerce websites come in various forms, including B2C (Business to Consumer), B2B (Business to Business), C2C (Consumer to Consumer), and more.
                </p>
            </div>
    </div>
  )
}

export default DescriptionBox