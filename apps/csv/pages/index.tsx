import { Container, Alert } from "react-bootstrap";
import GitHubForkRibbon from "react-github-fork-ribbon";
import Head from "next/head";

import "bootstrap/dist/css/bootstrap.min.css";

import { Csv } from "../src/Csv";

export default function Homepage() {
  return (
    <Container>
      <Head>
        <title>Anonymisation CSV</title>
      </Head>
      <GitHubForkRibbon
        href="//github.com/socialgouv/anonymify"
        target="_blank"
        position="right"
      >
        Fork me on GitHub
      </GitHubForkRibbon>
      <div
        style={{
          textAlign: "center",
          fontFamily: "Trebuchet Ms, Verdana",
          paddingTop: 20,
        }}
      >
        <Alert>
          <h1>Anonymisation de CSV</h1>
          <p>Anonymisez vos données sans les transmettre</p>
        </Alert>
        <Csv />
      </div>
    </Container>
  );
}
