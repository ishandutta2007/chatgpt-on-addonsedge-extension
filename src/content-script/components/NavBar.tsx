import { Button, Navbar } from 'react-daisyui'

const NavBar = () => {
  return (
    <div
      style="user-select: none;
                text-rendering: optimizeLegibility;
                box-sizing: content-box;
                font: inherit;
                font-size: 100%;
                vertical-align: initial;
                outline: none;
                padding: 0;
                margin: 0;
                border: 0;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                color: #333951;"
    >
      <Navbar
        data-testid="nav-bar"
        style="user-select: none;
              text-rendering: optimizeLegibility;
              color: #333951;
              font: inherit;
              font-size: 100%;
              vertical-align: initial;
              outline: none;
              margin: 0;
              border: 0;
              position: relative;
              z-index: 252;
              display: flex;
              justify-content: space-between;
              height: 48px;
              background-color: #f5f5f5;
              border-bottom: 1px solid #e5e5e6;
              padding: 0 10px;
              box-sizing: border-box;"
      >
        <Navbar.Start>
          <Button className="text-xl normal-case p-2" color="ghost">
            Button1
          </Button>
          <Button className="text-xl normal-case p-2" color="ghost">
            Button2
          </Button>
        </Navbar.Start>
        <Navbar.End>
          <Button className="text-xl normal-case p-2" color="ghost">
            ButtonR2
          </Button>
          <Button className="text-xl normal-case p-2" color="ghost">
            ButtonR1
          </Button>
        </Navbar.End>
      </Navbar>
    </div>
  )
}
// Navbar: className="flex  w-full component-preview py-4 align-middle justify-between gap-2 font-sans"
export default NavBar
//https://github.com/Claytonrss/masonry-gallery-microfrontend/blob/258a6bc150539668758dcfaa494bb1fd725ab48e/apps/host/src/components/NavBar.tsx
