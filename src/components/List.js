// Components
import EscrowComponent from './EscrowComponent';
import { useState } from 'react';

const List = (props) => {
  const [house, setHouse] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (house) => {
    setHouse(house)
    toggle ? setToggle(false) : setToggle(true)
  }

  return (
    <div>
      <div className='cards__section'>

        <h3>EscrowFi</h3>

        <hr />
        
        <div className='cards'>
          {props.houses.map((house, index) => (
            <div className='card' key={index} onClick={() => togglePop(house)}>
              <div className='card__image'>
                <img src={house.image} alt='House' />
              </div>
              <div className='card__info'>
                <h4>{house.attributes[0].value} ETH</h4>
                <p>
                  <strong>{house.attributes[2].value}</strong> bds |
                  <strong>{house.attributes[3].value}</strong> ba |
                  <strong>{house.attributes[4].value}</strong> sqft
                </p>
                <p>{house.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <EscrowComponent { ...{...props, ...{ togglePop: togglePop, house: house }} } />
      )}

    </div>
  );
}

export default List;
