import List from './List';
import Search from './Search';

const HomePage = (props) => {
  return (
    <>
      <Search {...props} />
      <List {...props} />
    </>
  );
}

export default HomePage;
