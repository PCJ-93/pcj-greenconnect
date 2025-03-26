import React from 'react';
import Merge from './merge/Merge';
import Footer from './footer/Footer';
import { useLocation } from 'react-router-dom';
import Header from './header/Header';

function App() {

  return (
    <>
      {useLocation().pathname !== "/gpayCharge" && (
        <div style={{ marginBottom: "50px" }}>
          <Header />
        </div>
      )}
      <Merge />;
      {
        useLocation().pathname !== "/gpayCharge" && (
          <div>
            <Footer />
          </div>
        )
      }
    </>
  )

}
export default App;