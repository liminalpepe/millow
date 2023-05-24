// Components
import House from '../models/House'
import HouseNFTAdapter from '../models/adapters/HouseNFTAdapter'
import { useState } from 'react'
import { create as ipfsHttpClient } from "ipfs-http-client"
import { Buffer } from 'buffer'
import { ethers } from 'ethers';
 
// non secure keys (and limited on infura to 1GB data) only serving my demo projects
// for production prefer self hosted backend to store keys
const projectId = '2Q0jSZizw2YWoQsvmMXFn4MPxkD'
const projectSecret = '22166ad78cdea820ad293ee1545e50a4'
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
const infuraProjectGateway = 'https://millow.infura-ipfs.io/ipfs/'
const ipfsClient = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  } 
})

const MinList = (props) => {
  const placeHolderHouse = () => {
    const sampleHouse = new House()
    sampleHouse.name = 'Confy family house'
    sampleHouse.address = '16751 SW Dove Rd, Terrebonne, OR 97760'
    sampleHouse.description = 'Family house confy and contry located'
    sampleHouse.purchasePrice = 100
    sampleHouse.escrowAmount = 75
    sampleHouse.typeOfResidence = 'Single family residence'
    sampleHouse.bedRooms = 3
    sampleHouse.bathrooms = 2
    sampleHouse.squareFeet = 3200
    sampleHouse.yearBuilt = 2006
    sampleHouse.buyerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    return sampleHouse
  }
  const [house, setHouse] = useState(placeHolderHouse())
  const [image, setImage] = useState('')
  
  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    setHouse({ ...house, [name]: value })
  }

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await ipfsClient.add(file)
        const uri = `${infuraProjectGateway}${result.path}`
        setImage(uri)
        setHouse({ ...house, imageUrl: uri })
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }

  const isEmpty = (value) => {
    return !value || !value.length
  }

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  
  const mint = async () => {
    const realEstate = props.realEstate

    const newHouse = { ...house }
    const totalSupply = await realEstate.totalSupply()
    newHouse.id = totalSupply.toNumber() + 1
    
    const nftHouse = HouseNFTAdapter.load(newHouse)
    const result = await ipfsClient.add(JSON.stringify(nftHouse))
    const tokenURI = `${infuraProjectGateway}${result.path}`
    
    const sellerSigner = await props.provider.getSigner()
    let transaction = await realEstate.connect(sellerSigner).mint(tokenURI)
    await transaction.wait()

    const escrow = props.escrow
    // approve escrow contract to transfer this nft
    transaction = await realEstate.connect(sellerSigner).approve(escrow.address, nftHouse.id)
    await transaction.wait()

    house.id = nftHouse.id
    setHouse(house)
  }

  const list = async () => {
    const escrow = props.escrow
    const sellerSigner = await props.provider.getSigner()

    const transaction = await escrow.connect(sellerSigner).list(house.id, house.buyerAddress, tokens(house.purchasePrice), tokens(house.escrowAmount))
    await transaction.wait()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image || isEmpty(house.name) || isEmpty(house.address) || isEmpty(house.description) || !house.purchasePrice || !house.escrowAmount) return

    await mint()
    await list()
  }

  return (
    <div className='sell__details'>
      <div className='form'>
        <h1>Sell House</h1>
        <form>

          <h2>Overview</h2>

          <div className='form-control'>
            <label htmlFor='name'>Name: </label>
            <input
              type='text'
              id='name'
              name='name'
              value={house.name}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='address'>Address: </label>
            <input
              type='address'
              id='address'
              name='address'
              value={house.address}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='description'>Description: </label>
            <input
              type='text'
              id='description'
              name='description'
              value={house.description}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='purchasePrice'>Purchase Price: </label>
            <input
              type='number'
              id='purchasePrice'
              name='purchasePrice'
              value={house.purchasePrice}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='escrowAmount'>Downpayment: </label>
            <input
              type='number'
              id='escrowAmount'
              name='escrowAmount'
              value={house.escrowAmount}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='image'>Image URL: </label>
            <input
              type='file'
              id='image'
              name='image'
              onChange={uploadToIPFS}
            />
          </div>

          <h2>Features</h2>

          <div className='form-control'>
            <label htmlFor='typeOfResidence'>Type of Residence: </label>
            <input
              type='text'
              id='typeOfResidence'
              name='typeOfResidence'
              value={house.typeOfResidence}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='bedRooms'>Bed Rooms: </label>
            <input
              type='number'
              id='bedRooms'
              name='bedRooms'
              value={house.bedRooms}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='bathrooms'>Bathrooms: </label>
            <input
              type='number'
              id='bathrooms'
              name='bathrooms'
              value={house.bathrooms}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='squareFeet'>Square feet: </label>
            <input
              type='number'
              id='squareFeet'
              name='squareFeet'
              value={house.squareFeet}
              onChange={handleChange}
            /> m2
          </div>

          <div className='form-control'>
            <label htmlFor='yearBuilt'>Year Built: </label>
            <input
              type='number'
              id='yearBuilt'
              name='yearBuilt'
              value={house.yearBuilt}
              onChange={handleChange}
            />
          </div>

          <div className='form-control'>
            <label htmlFor='buyerAddress'>Buyer Address: </label>
            <input
              type='text'
              id='buyerAddress'
              name='buyerAddress'
              value={house.buyerAddress}
              onChange={handleChange}
            />
          </div>

          <button type='submit' className='btn' onClick={handleSubmit}>
            Mint and list new Real State
          </button>
        </form>
      </div>
    </div>
  )
}

export default MinList
 