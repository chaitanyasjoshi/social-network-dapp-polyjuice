import React, { Component } from 'react';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { CONFIG } from './config';
import NavBar from './NavBar';
import Web3 from 'web3';
import SocialNetwork from '../abis/SocialNetwork.json';
import Main from './Main';

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
      const providerConfig = {
        rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
        ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
        web3Url: godwokenRpcUrl,
      };
      const provider = new PolyjuiceHttpProvider(
        godwokenRpcUrl,
        providerConfig
      );

      window.web3 = new Web3(provider);
      // const web3 = new Web3(provider);
      // this.setState({ web3 });
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    // Load user account
    const accounts = [window.ethereum.selectedAddress];
    this.setState({ account: accounts[0] });

    // Network ID, address and abi
    const networkID = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkID];
    if (networkData) {
      const socialNetwork = new web3.eth.Contract(
        SocialNetwork.abi,
        networkData.address
      );
      this.setState({ socialNetwork });
      const postCount = await socialNetwork.methods.postCount().call();
      this.setState({ postCount });

      // Load posts
      for (let i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call();
        this.setState({ posts: [...this.state.posts, post] });
      }

      this.setState({ loading: false });
    } else {
      window.alert('SocialNetwork contract not deployed to detected network');
    }
  }

  createPost(content) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods
      .createPost(content)
      .send({
        gas: 6000000,
        from: this.state.account,
      })
      .then((receipt) => {
        this.setState({ loading: false });
      });
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods
      .tipPost(id)
      .send({ gas: 6000000, from: this.state.account, value: tipAmount })
      .then((receipt) => {
        this.setState({ loading: false });
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true,
    };

    this.createPost = this.createPost.bind(this);
    this.tipPost = this.tipPost.bind(this);
  }

  render() {
    return (
      <div>
        <NavBar account={this.state.account} />
        {this.state.loading ? (
          <div id='loader' className='text-center mt-5'>
            <p>Loading...</p>
          </div>
        ) : (
          <Main
            posts={this.state.posts}
            createPost={this.createPost}
            tipPost={this.tipPost}
          />
        )}
      </div>
    );
  }
}

export default App;
