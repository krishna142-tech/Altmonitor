import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#121516] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#2c3135] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_535)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_535">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">AltMonitor</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Overview
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Features
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Pricing
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Resources
              </a>
            </div>
            <Link
              to="/login"
              className="flex min-w-[7rem] max-w-[40rem] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#c5daeb] text-[#121516] text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Login</span>
            </Link>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[80rem] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[40rem] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpGhuVdpllKJbEdPcMerLoIEYFYyOuDkkU9mmSNsgb4oan5sWj8B4_WkcLNtqaHp_oU5nSWde_aqXoqEscoBesUKdg96b5z5wKdF625TWy9ObJcx88QadX4tqyrsPKA7-MHXNvx9Qb_vRb2Qc1ZgT9as8mK1JsijfkKSI6pLhinK9tMtupTE7Iod3iAt8nEgUKQ9mgPi0GB0Kb4SMDS0FdXFunVRJHAsH4krKR_DPnQPl57VsNCuvWA4N6GqYXrJjErn3QGmXdhGE")`
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      AltMonitor – Invest with Confidence
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      A sleek, secure platform to monitor private investments in real-time.
                    </h2>
                  </div>
                  <Link
                    to="/login"
                    className="flex min-w-[7rem] max-w-[40rem] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#c5daeb] text-[#121516] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                  >
                    <span className="truncate">Login</span>
                  </Link>
                </div>
              </div>
            </div>
            <h2 className="text-white text-[1.833rem] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">What is AltMonitor?</h2>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
              AltMonitor is a cutting-edge platform designed to provide investors with real-time insights into their private equity transactions. With a focus on security and user
              experience, AltMonitor offers a comprehensive suite of tools to track investments, analyze performance, and make informed decisions. Our intuitive interface and
              robust features empower investors to manage their portfolios with confidence and precision.
            </p>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Key Features</h2>
            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1 className="text-white tracking-light text-[2.667rem] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[60rem]">
                  Empowering Investors with Advanced Tools
                </h1>
                <p className="text-white text-base font-normal leading-normal max-w-[720px]">
                  AltMonitor provides a suite of powerful features designed to enhance your investment experience and maximize returns.
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                <div className="flex flex-1 gap-3 rounded-lg border border-[#40484f] bg-[#1e2124] p-4 flex-col">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Real-Time Tracking</h2>
                    <p className="text-[#a2acb3] text-sm font-normal leading-normal">Monitor your investments in real-time with up-to-the-minute data and analytics.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#40484f] bg-[#1e2124] p-4 flex-col">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Secure Transactions</h2>
                    <p className="text-[#a2acb3] text-sm font-normal leading-normal">
                      Ensure the security of your transactions with our advanced encryption and authentication protocols.
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#40484f] bg-[#1e2124] p-4 flex-col">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Portfolio Management</h2>
                    <p className="text-[#a2acb3] text-sm font-normal leading-normal">Manage your entire investment portfolio from a single, intuitive dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="@container">
              <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-white tracking-light text-[2.667rem] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[60rem]">
                    Ready to Take Control of Your Investments?
                  </h1>
                  <p className="text-white text-base font-normal leading-normal max-w-[720px]">Join AltMonitor today and experience the future of private equity management.</p>
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex justify-center">
                    <Link
                      to="/login"
                      className="flex min-w-[7rem] max-w-[40rem] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#c5daeb] text-[#121516] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow"
                    >
                      <span className="truncate">Get Started</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
