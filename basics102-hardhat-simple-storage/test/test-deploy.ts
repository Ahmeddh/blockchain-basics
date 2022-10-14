import {expect, assert } from "chai"
import {ethers} from "hardhat"


describe("Simple Storage", function(){
  let simpleStorageFactory, simpleStorage

  beforeEach(async function(){
     simpleStorageFactory= await ethers.getContractFactory("SimpleStorage")
     simpleStorage = await simpleStorageFactory.deploy()
  })

  it("Should start with a favorite number of 0", async function() {
    const currentValue =await simpleStorage.retrieve()
    const expectedValue="0"

    assert.equal(currentValue.toString(),expectedValue)
    
  }) 
  
  it("Should update when we call store", async function(){
    const currentValue =await simpleStorage.retrieve()
    await simpleStorage.store(5)
    const newValue =await simpleStorage.retrieve()

    assert.notEqual(currentValue.toString(),newValue.toString())
  })

  // it("Should add a person and store favourite number", async function(){
  //   //add a person
  //   const favNo=5
  //   const name="Ahmed"

  //   await simpleStorage.addPerson(name,favNo)
  //   const retrievedName= await simpleStorage.returnPerson(favNo)
    
  //   //test if a new person is addeed with the same address & fav number
  //   assert.equal(name.toString(),retrievedName.toString())
  // })
})