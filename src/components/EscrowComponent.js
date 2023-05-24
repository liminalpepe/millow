import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const EscrowComponent = (props) => {
  const { house, provider, account, escrow, togglePop } = props;
  const [hasBought, setHasBought] = useState(false)
  const [hasLended, setHasLended] = useState(false)
  const [hasInspected, setHasInspected] = useState(false)
  const [hasSold, setHasSold] = useState(false)
  const [buyer, setBuyer] = useState(null)
  const [lender, setLender] = useState(null)
  const [inspector, setInspector] = useState(null)
  const [seller, setSeller] = useState(null)

  const [owner, setOwner] = useState(null)

  const fetchDetails = async () => {
    const buyer = await escrow.buyer(house.id)
    setBuyer(buyer)

    const hasBought = await escrow.approval(house.id, buyer)
    setHasBought(hasBought)

    const seller = await escrow.seller()
    setSeller(seller)

    const hasSold = await escrow.approval(house.id, seller)
    setHasSold(hasSold)

    const lender = await escrow.lender()
    setLender(lender)

    const hasLended = await escrow.approval(house.id, lender)
    setHasLended(hasLended)

    const inspector = await escrow.inspector()
    setInspector(inspector)

    const hasInspected = await escrow.inspectionPassed(house.id)
    setHasInspected(hasInspected)
  }

  const fetchOwner = async () => {
    if(await escrow.isListed(house.id)) return

    const owner = await escrow.buyer(house.id)
    setOwner(owner)
  }

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(house.id)
    const signer = await provider.getSigner()

    // Buyer deposit earnest
    let transaction = await escrow.connect(signer).depositEarnest(house.id, { value: escrowAmount })
    await transaction.wait()

    // Buyer approves
    transaction = await escrow.connect(signer).approveSale(house.id)
    await transaction.wait()

    setHasBought(true)
  }

  const inspectHandler = async () => {
    const signer = await provider.getSigner()

    // Inpector updates status
    const transaction = await escrow.connect(signer).updateInspectionStatus(house.id, true)
    await transaction.wait()

    setHasInspected(true)
  }

  const lendHandler = async () => {
    const signer = await provider.getSigner();

    // Lender approves
    const transaction = await escrow.connect(signer).approveSale(house.id)
    await transaction.wait()

    // Lender sends funds to contract
    const lendAmount = (await escrow.purchasePrice(house.id) - await escrow.escrowAmount(house.id))
    await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

    setHasLended(true)
  }

  const sellHandler = async () => {

    const signer = await provider.getSigner()

    // Seller approves
    let transaction = await escrow.connect(signer).approveSale(house.id)
    await transaction.wait()

    // Seller finalize
    transaction = await escrow.connect(signer).finalizeSale(house.id)
    await transaction.wait()
    
    setHasSold(true)
  }

  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold])

  return (
    <div className="house">
      <div className='house__details'>
        <div className="house__image">
            <img src={house.image} alt="House" />
        </div>
        <div className='house__overview'>
          <h1>{house.name}</h1>
          <p>
            <strong>{house.attributes[2].value}</strong> bds |
            <strong>{house.attributes[3].value}</strong> ba |
            <strong>{house.attributes[4].value}</strong> sqft
          </p>
          <p>{house.address}</p>
          <h2>{house.attributes[0].value} ETH</h2>

          {owner ? (
            <div className='house__owned'>
                Owned by {owner.slice(0,6) + '...' + owner.slice(38, 42)
                }
            </div>
          ) : (
            <div>
              {(account === inspector) ? (
                <button className='house__contact' onClick={inspectHandler} disabled={hasInspected}>
                    Approve Inspection
                </button>
              ) : (account === lender) ? (
                <button className='house__contact' onClick={lendHandler} disabled={hasLended}>
                    Approve & Lend
                </button>
              ) : (account === seller) ? (
                <button className='house__contact' onClick={sellHandler} disabled={hasSold}>
                    Approve & Sell
                </button>
              ) : (
                <button className='house__buy' onClick={buyHandler} disabled={hasBought}>
                    Buy
                </button> 
              )}

              <button className='house__contact'>
                  Contact agent
              </button>
            </div>
          )}

          <hr />

          <h2>Overview</h2>
          
          <p>
            {house.description}
          </p>
          
          <hr />

          <h2>Overview</h2>

          <ul>
            {house.attributes.map((attribute, index) => (
              <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
            ))}
          </ul>

        </div>

        <button onClick={togglePop} className='house__close'>
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default EscrowComponent;
