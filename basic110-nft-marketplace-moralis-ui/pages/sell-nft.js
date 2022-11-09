import Head from "next/head"
import styles from "../styles/Home.module.css"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Minimalistic NFT Marketplace" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>Hi from sell page</h1>
        </div>
    )
}
