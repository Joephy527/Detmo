"use client";
import { Button } from "@/components/ui/button";
import { auth, Client } from "@clerk/nextjs/server";
// import { VideoIcon } from '@radix-ui/react-icons'
import { LucidePlay } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect } from "react";
import ScrollButton from "@/components/ui/scrollButton";
import { useAuth, useUser } from "@clerk/nextjs";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  const { isLoaded, user } = useUser();
  /* const { getToken } = useAuth();
    useEffect(() => {
        const fetchToken = async () => {
            if (isLoaded && user) {
                try {
                    const token = await getToken();
                    console.log('User token:', token);
                } catch (error) {
                    console.error('Error fetching token:', error);
                }
            }
        };

        fetchToken();
    }, [isLoaded, user, getToken]); */

  const userId = user?.id;

  return (
    <div className="bg-background pt-10 p-2   flex flex-col justify-center items-center gap-8">
      {/* hero section  */}
      <section className="flex flex-col justify-center md:p-3 p-2 container max-w-screen-md  text-center  gap-5">
        <h1 className=" text-3xl md:text-4xl lg:text-5xl font-bold text-wrap md:px-4 px-2 lg:leading-[60px]">
          Unlock the <span className="text-destructive/60"> Power</span> of
          Strategic Sourcing in Procurement
          {/* Efficient Procurement */}
        </h1>
        <h2 className="  md:text-lg text-wrap font-normal">
          Discover your spend insights, evaluate and discover the perfect
          suppliers with our advanced analytics platform
          {/* Discover your spend insights, evaluate and discover the perfect suppliers with our advanced <span className='text-destructive/60'><b>analytics</b></span> platform */}
          {/* Discover your spend insights, evaluate and discover the perfect suppliers with our advanced procurement software */}
        </h2>
        <div className="flex justify-center items-center gap-3">
          {!userId ? (
            <Link href="/sign-in">
              <Button size="lg">Start Free Trial</Button>
            </Link>
          ) : (
            <Link href="/dashboard/spend-analysis">
              <Button size="lg">Dashboard</Button>
            </Link>
          )}

          <ScrollButton targetId="demo" label="View Demos" />
        </div>
      </section>
      {/* landing image section  */}
      <section className="">
        <Image src="/landing.svg" alt="landing" width={1000} height={1000} />
      </section>
      {/* trusted by section  */}
      <section className="flex flex-col justify-center md:p-3 p-2 container text-center  gap-5">
        <h3 className="text-lg">Trusted by Procurement Managers Worldwide</h3>
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {/* <Image
						src='/trust/zoom.svg'
						alt='logo'
						width={180}
						height={80}
						className='w-24 md:w-44'
					/>
					<Image
						src='/trust/avatar.svg'
						alt='logo'
						width={180}
						height={80}
						className='w-24 md:w-44'
					/>
					<Image
						src='/trust/ui-path.svg'
						alt='logo'
						width={180}
						height={80}
						className='w-24 md:w-44'
					/>
					<Image
						src='/trust/fast.svg'
						alt='logo'
						width={180}
						height={80}
						className='w-24 md:w-44'
					/>
					<Image
						src='/trust/axon.svg'
						alt='logo'
						width={180}
						height={80}
						className='w-24 md:w-44'
					/> */}
        </div>
      </section>
      {/* video section */}

      <section
        className="flex flex-col justify-center p-5 w-full
        align-middle  mx-auto  text-center  gap-6 items-center bg-[#F6F6F6] rounded-md"
        id="demo"
      >
        <div className="container px-5 py-24 mx-auto flex flex-col gap-4">
          <div className="text-center mb-20 ">
            <h2 className=" text-2xl font-medium text-center title-font ">
              Empowering Procurement Excellence{" "}
            </h2>
          </div>
          <article className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2">
            {/* <div style={{ position: 'relative', paddingBottom: 'calc(45.27777777777778% + 41px)', height: 0, width: '100%' }}>
							<iframe
								src="https://demo.arcade.software/YVaqxxSIpfUaZJvyzXEC?embed&show_copy_link=true"
								title="detmo sourcing-spend analysis"
								frameBorder="0"
								loading="lazy"
								// webkitAllowFullScreen
								// mozAllowFullScreen
								allowFullScreen
								allow="clipboard-write"
								style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', colorScheme: 'light' }}
							/>
						</div> */}
            <div className="p-2 sm:w-1/2 w-full">
              <iframe
                className="rounded-lg p-1 border-2 border-secondary w-full aspect-video max-w-[450px] shadow-md bg-muted-foreground"
                src="https://demo.arcade.software/YVaqxxSIpfUaZJvyzXEC?embed&show_copy_link=true"
                // https://www.youtube.com/embed/JxS5E-kZc2s
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
                title="detmo sourcing-spend analysis"
              ></iframe>
            </div>

            <div className="p-2 sm:w-1/2 w-full text-start">
              {/* subtitle */}
              <h3 className="text-xl font-medium title-font mb-4 text-destructive/70">
                1. Identify sourcing opportunities by using Spend Analysis
              </h3>
              <div className="flex flex-col gap-3 py-4">
                <div className="bg-muted rounded flex   items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Quickly and clearly identify sourcing pain points
                  </span>
                </div>
                <div className="bg-muted rounded flex   items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Discover new sourcing opportunities through data driven
                    insights.
                  </span>
                </div>
                <div className="bg-muted rounded flex  items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Gain deeper insight into your spending patterns.
                    {/* Analyze spending by suppliers, time, commodities, and locations. */}
                  </span>
                </div>
                <div className="bg-muted rounded flex  items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Maximize cost savings and optimize budget allocation.
                  </span>
                </div>
              </div>
            </div>
          </article>
          <article className="flex flex-row-reverse flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2">
            <div className="p-2 sm:w-1/2 w-full">
              <iframe
                className="rounded-lg p-1 border-2 border-secondary w-full aspect-video max-w-[450px] shadow-md bg-muted-foreground"
                src="https://demo.arcade.software/XkYqprhxGj2MqqWMEUEu?embed&show_copy_link=true"
                // 'https://www.youtube.com/embed/JxS5E-kZc2s'
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-4 sm:w-1/2 w-full text-start  ">
              {/* subtitle */}
              <h3 className="text-xl font-medium title-font mb-4 text-destructive/70">
                2. Create, collaborate and manage Sourcing Projects
              </h3>
              <div className="flex flex-col gap-3 py-4">
                <div className="bg-muted rounded flex   items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Enables real-time visibility, collaboration and
                    communication
                  </span>
                </div>
                <div className="bg-muted rounded flex  items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Enhanced Agile Kanban foundation project management
                  </span>
                </div>
                <div className="bg-muted rounded flex  items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Automation and continuous improvement of your processes
                  </span>
                </div>
              </div>
            </div>
          </article>
          <article className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2">
            <div className="p-2 sm:w-1/2 w-full">
              <iframe
                className="rounded-lg p-1 border-2 border-secondary w-full aspect-video max-w-[450px] shadow-md bg-muted-foreground"
                src="https://demo.arcade.software/LgPCD133mnuGADqZdSd8?embed&show_copy_link=true"
                // https://www.youtube.com/embed/JxS5E-kZc2s
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
              ></iframe>
            </div>

            <div className="p-4 sm:w-1/2 w-full text-start  ">
              {/* subtitle */}
              <h3 className="text-xl font-medium title-font mb-4 text-destructive/70">
                3. Evaluate Suppliers using advanced analytics
              </h3>
              <div className="flex flex-col gap-3 py-4">
                <div className="bg-muted rounded flex   items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Find the ideal supplier for your unique sourcing
                    opportunities.
                  </span>
                </div>
                <div className="bg-muted rounded flex   items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Evaluate suppliers based on multivariate analysis
                  </span>
                </div>
                <div className="bg-muted rounded flex  items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Add your own suppliers and suppliers from our home grown
                    catalog
                  </span>
                </div>
                <div className="bg-muted rounded flex  items-center">
                  <LucidePlay className="size-4 mr-3 fill-foreground" />
                  <span className="text-secondary-foreground">
                    Ensure optimal supplier selection based on cost, quality,
                    and delivery.
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
      {/* profile company section  */}
      <section
        className="flex flex-col justify-center md:p-20 container 
       mx-auto  text-center  gap-6 items-center "
      >
        {/* <h3 className="text-lg"> </h3> */}
        <article className="flex flex-col md:flex-row justify-stretch items-start gap-20">
          {/* <div className="w-96 md:w-[450px]  aspect-video flex justify-center items-center align-middle"> */}
          <Image
            src="/profile.svg"
            alt="profile"
            width={280}
            height={280}
            className="w-96 md:w-[450px]  min-w-[280px]  min-h-[280px] block"
          />
          {/* </div> */}
          <div className=" text-start flex flex-col  gap-5">
            <h3 className="text-2xl text-semibold">
              Dear Procurement Professionals
            </h3>
            <p className="text-lg text-wrap font-normal">
              At detmo, we understand the complexities of procurement management
              and the impact it has on your organization&#39;s success.
              That&#39;s why we created our cutting-edge procurement software—to
              revolutionize the way you streamline your operations, drive cost
              efficiencies, and achieve procurement excellence.
            </p>
            <p className="text-lg text-wrap font-normal">
              Our software&#39;s powerful spend analysis capabilities and
              advanced sourcing projects feature are designed to empower you
              with actionable insights and enable seamless supplier selection.
              Join the ever-growing community of satisfied customers who have
              transformed their procurement processes with our software.
            </p>
            <p className="text-lg text-wrap font-normal text-muted-foreground">
              Sincerely,
              <br />
              <span className="text-destructive/60">{"detmo"}</span>
            </p>
          </div>
        </article>
      </section>
      {/* footer hero section */}
      <div className="bg-muted w-full py-10">
        <section className="flex flex-col justify-center md:p-3 p-2 container max-w-screen-md  text-center  gap-5 ">
          <h1 className="max-w-[740px] mx-auto text-center text-3xl md:text-4xl lg:text-5xl font-bold text-wrap md:px-4 lg:leading-[60px]">
            Experience Next-Level Procurement Efficiency!{" "}
          </h1>

          <div className="flex justify-center items-center gap-3">
            <Button size="lg" asChild>
              <Link href={"/sign-in"}>Start Free Trial</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;
