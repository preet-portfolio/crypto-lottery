import type { NextPage } from 'next';
import Head from 'next/head';

import Header from '../components/Header';
import { 
  useAddress, 
  useContract, 
  useMetamask, 
  useDisconnect, 
  useContractData, 
  useContractCall, 
} from '@thirdweb-dev/react';
import Login from '../components/Login';
import Loading from '../components/Loading';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { currency } from '../constants';
import CountDownTimer from '../components/CountDownTimer';
import toast, { Toaster } from "react-hot-toast"
import AdminControls from '../components/AdminControls';


const Home: NextPage = () => {
  const address = useAddress();
  const [userTickets, setUserTickets] = useState(0);
  const [quantity, setQuantity] = useState<number>(1);
  const {contract, isLoading } = useContract(
    process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
    );
    const { data: expiration } = useContractData(
      contract, "expiration"
    );
    const { data: remainingTickets } = useContractData(
      contract, "RemainingTickets"
    );
    const { data: currentWinningReward } = useContractData(
      contract, "currentWinningReward"
    );
    const { data: ticketPrice } = useContractData(
      contract, "ticketPrice"
    );
    const { data: ticketCommission } = useContractData(
      contract, "ticketCommission"
    );
    const {data: tickets} = useContractData(contract, "getTickets")


    const { mutateAsync: BuyTickets } = useContractCall(
      contract, "BuyTickets"
    );

    const {data: winnings } = useContractData(
      contract, "getWinningForAddress",
    )

    const {mutateAsync: WithdrawWinnings} = useContractCall(
      contract, "WithdrawWinnings"
    )

    const {data: isLotteryOperator} = useContractData(
      contract, "lotteryOperator"
    )

    useEffect(() => {
      if (!tickets) return;

      const totalTickets: string[] = tickets;

      const noOfUserTickets = totalTickets.reduce(
        (total, ticketAddress) => (ticketAddress === address ? total + 1 : total),
        0
      )
      setUserTickets(noOfUserTickets);
    }, [tickets, address])
    
    const handleClick = async() =>{
      if(!ticketPrice) return;

      const notification = toast.loading("Buying your ticket...");

      try {
        const data = await BuyTickets([{
          value:ethers.utils.parseEther((Number(ethers.utils.formatEther(ticketPrice))* quantity).toString()
          ),
        }]);

        toast.success("Tickets purchased successfully!", {
          id:notification,
        })


      } catch(err) {
        toast.error("Whoops something went wrong!", {
          id:notification,
        
        })
        console.error("Contract call failure", err);

      }


    }
  
  const onWidthdrawWinnings = async () => {
    const notification = toast.loading("Withdrawing winnings ...")

    try{
      const data = await WithdrawWinnings([{}]);

    } catch(err) {
      toast.error("Whoops something went wrong!", {
        id:notification,
      });
      console.error("Contract call failure", err)

    }

  }
  
  if (isLoading) return<Loading /> 
  
  
    if(!address) return<Login />; 




  
  return (
    <div className="bg-[#091b18] min-h-screen flex flex-col">
      <Head>
        <title>Preet Panchal's Crypto Lottery</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='flex-1'>
      <Header/>

      {isLotteryOperator === address && (
        <div className='flex-justify-center'>
          <AdminControls />
        </div>
      )}

      {winnings > 0 && (
        <div className='max-w md:max-w-2xl lg:max-w-4xl mx-auto mt-5'>
          <button onClick={onWidthdrawWinnings} className='p-5 bg-gradient-to-b from-orange-500 to-emerald-500 animate-pulse text-center rounded-xl w-full'>
            <p className='font-bold'>Winner Winner Chicken Dinner!</p>
            <p> Total Winning: {ethers.utils.formatEther(winnings.toString())}{""}{currency}</p>
            <br />
            <p className='font-semibold'> Click here to Withdraw</p>

          </button>
        </div>
      )}
  
  {/* Next Draw box */}
  <div className='space-y-5 md:space-y-0 
  m-5 md:flex md:flex-row items-start 
  justify-center md:space-x-5'>
   <div className='stats-container' >
     <h1 className='text-5xl text-white font-semibold text-center'>The Next Draw</h1>
   
   <div className='flex justify-between p-2 space-x-2'>
     <div className='stats'>
       <h2 className='text-sm'>Total Pool</h2>
       <p className='text-xl'>
        {currentWinningReward && ethers.utils.formatEther(currentWinningReward.toString()
        )}{""}
        {currency}
       </p>
       </div>
       
         <div className="stats">
           <h2 className='text-sm'>Ticket Remaining</h2>
           <p className='text-xl'>{remainingTickets?.toNumber()}</p>
         </div>
       </div>


       {/* Countdown Timer */}
       <div className='mt-5 mb-3'>
        <CountDownTimer />

       </div>


       </div>
       <div className="stats-container space-y-2">
         <div className="state-container">
           <div className='flex justify-between items-center text-white pb -2'>
             <h2>Price Per Ticket</h2>
             <p>
              {ticketPrice && ethers.utils.formatEther(ticketPrice.toString())}{" "} {currency}
             </p>
           </div>
           <div className='flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4 '>
             <p>Tickets</p>
             <input className='flex w-full bg-transparent text-right outline-none' 
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={e=> setQuantity(Number(e.target.value))}
              />
           </div>
           <div className='space-y-2 mt-5'>
             <div className='flex items-center justify-between text-emerald-300 text-sm italic font-extrabold'>
               <p>Total cost of tickets</p>
               <p>{ticketPrice && Number(ethers.utils.formatEther(ticketPrice.toString())) * quantity}{""} {currency}</p>
             </div>
             <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
               <p>Service Fees</p>
               <p>{ticketCommission && ethers.utils.formatEther(ticketCommission.toString())}{" "} {currency}</p>
             </div>
             <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
               <p>+ Network Fees</p>
               <p>TBC</p>
             </div>
           </div>

           {/* button */}
           <button 
          //  disabled={expiration?.toString() < Date.now().toString() || remainingTickets?.toNumber() === 0 }
           
           onClick={handleClick}
           
           className='mt-5 w-full bg-gradient-to-br 
           from-orange-500 to-emerald-600 px-10 py-5 
           rounded-md font-semibold text-white shadow-xl 
           disabled:from-gray-600 disabled:text-gray-100 disabled:to-gray-600 
           disabled:cursor-not-allowed'>Buy {quantity} ticket for {ticketPrice && Number(ethers.utils.formatEther(ticketPrice.toString()))
           * quantity} {""} {currency}
           </button>

         </div> 
         {userTickets > 0 && (
          <div className='stats'>
            <p className='text-lg mb-2'>you have {userTickets} Tickets in this draw.</p>
            <div className='flex max-w-sm flex-wrap gap-x-2 gap-y-2'>
              {Array(userTickets).fill("").map((_,index) => (
                <p key={index} className="text-emerald-300 h-20 w-12 
                bg-emerald-500/30 rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic ">{index + 1}</p>
              ))}
            </div>
          </div>
         )}
       </div>
   </div>
  
  {/* The price per ticket box */}
  <div>

  </div>
      </div>
    <footer className='border-t border-emerald-500/20 flex items-center text-white justify-between p-5'>
      <img className='h-10 w-10 filter hue-rotate-90 opacity-20 rounded-full' 
      src='https://i.imgur.com/4h7mAu7.png' alt='' />
      <p className='text-xs text-emerald-400 p-5'>
        DISCLAIMER: This is made for my personal practice and for education purpose only. 
        the content of this website is not intended to be a lure to glambling. Instead, 
        the information presented is meant for nothing more than learning and entertainment 
        purposes. I am not liable for any losses that are incurred or problems that arise at 
        online casinos or elsewhere after the reading and consideration of this website content. 
        if you are gambling online utilizing information from this website, you are doing so 
        completely and totally at your own risk.
      </p>

    </footer>
    
    </div>
  )
}

export default Home
