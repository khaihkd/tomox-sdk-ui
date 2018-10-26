import React from 'react'
import Colors from './Colors'

function getIntentColor(intent) {
  switch (intent) {
    case 'success':
      return Colors.GREEN4
    case 'primary':
      return Colors.BLUE5
    case 'error':
      return Colors.RED4
    case 'warning':
      return Colors.GOLD4

    default:
      return Colors.WHITE
  }
}

const SvgIcon = ({ style, width, height, intent, icon }) => {
  const fillColor = getIntentColor(intent)
  return (
    <div style={style}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Capa_1"
        x="0px"
        y="0px"
        width={width ? width : '25px'}
        height={height ? height : '100%'}
        viewBox="0 0 611.989 611.988"
        style={{ enableBackground: 'new 0 0 611.989 611.988' }}
        xmlSpace="preserve"
      >
        <GetIcon icon={icon} fillColor={fillColor} />
      </svg>
    </div>
  )
}
export default SvgIcon

const GetIcon = ({ icon, fillColor }) => {
  switch (icon) {
    case 'connect-signal':
      return (
        <g>
          <g>
            <g id="Wi-Fi">
              <g>
                <path
                  d="M305.994,417.769c-30.85,0-55.887,25.037-55.887,55.887s25.038,55.887,55.887,55.887s55.887-25.037,55.887-55.887     S336.843,417.769,305.994,417.769z M605.436,222.369C530.697,133.434,421.549,82.446,305.994,82.446     S81.309,133.434,6.551,222.369c-9.93,11.811-8.402,29.434,3.428,39.363c5.234,4.396,11.587,6.558,17.939,6.558     c7.973,0,15.891-3.391,21.423-9.967c64.084-76.248,157.639-119.989,256.652-119.989c99.013,0,192.568,43.741,256.651,119.971     c5.533,6.576,13.45,9.967,21.424,9.967c6.353,0,12.724-2.143,17.958-6.558C613.837,251.802,615.366,234.161,605.436,222.369z      M305.994,194.22c-82.545,0-160.489,36.419-213.879,99.926c-9.929,11.811-8.402,29.434,3.428,39.363     c5.234,4.396,11.605,6.558,17.958,6.558c7.973,0,15.891-3.391,21.405-9.967c42.716-50.838,105.086-79.993,171.089-79.993     c66.003,0,128.372,29.155,171.107,79.993c5.533,6.595,13.45,9.967,21.404,9.967c6.353,0,12.724-2.143,17.959-6.558     c11.829-9.929,13.356-27.57,3.428-39.363C466.483,230.64,388.539,194.22,305.994,194.22z M305.994,305.994     c-49.553,0-96.331,21.852-128.335,59.948c-9.93,11.811-8.402,29.434,3.428,39.363c5.234,4.396,11.605,6.557,17.958,6.557     c7.973,0,15.891-3.39,21.405-9.966c21.368-25.429,52.552-40.016,85.544-40.016s64.177,14.587,85.544,40.016     c5.533,6.595,13.45,9.966,21.405,9.966c6.353,0,12.724-2.142,17.958-6.557c11.83-9.93,13.357-27.553,3.428-39.363     C402.324,327.846,355.546,305.994,305.994,305.994z"
                  data-original="#000000"
                  className="active-path"
                  data-old_color={fillColor}
                  fill={fillColor}
                />
              </g>
            </g>
          </g>
        </g>
      )
    case 'external-link':
      return (
        <g>
          <path
            d="M266.422,0h-97.625c-9.65,0-17.5,7.851-17.5,17.5c0,9.649,7.85,17.5,17.5,17.5h55.377l-92.375,92.374		c-3.307,3.305-5.127,7.699-5.127,12.375c0,4.676,1.819,9.069,5.125,12.371c3.306,3.309,7.699,5.13,12.375,5.13		c4.674,0,9.069-1.82,12.376-5.127l92.374-92.375v55.377c0,9.649,7.851,17.5,17.5,17.5c9.649,0,17.5-7.851,17.5-17.5V17.5\		C283.922,7.851,276.071,0,266.422,0z"
            data-original="#000000"
            className="active-path"
            data-old_color={fillColor}
            fill={fillColor}
          />
          <path
            d="M201.137,253.922H30V82.785h128.711l30-30H15c-8.284,0-15,6.716-15,15v201.137c0,8.284,6.716,15,15,15h201.137c8.284,0,15-6.716,15-15V95.211l-30,30V253.922z"
            data-original="#000000"
            className="active-path"
            data-old_color={fillColor}
            fill={fillColor}
          />
        </g>
      )
    case 'wrapped-candy':
      return (
        <g>
          <path
            d="M590.878,429.648c-0.695-1.157-16.632-28.742-6.749-68.88c3.17-12.894,8.815-23.987,14.264-34.726
		c12.769-25.108,25.965-51.073-7.924-82.557c-12.768-11.86-6.642-50.485-1.674-67.349l6.535-22.224l-167.945,67.545
		c-29.08-33.087-74.009-52.8-122.179-52.8c-47.814,0-92.636,19.553-121.716,52.355L16.594,153.913l6.607,22.26
		c4.986,16.828,11.13,55.436-1.71,67.331c-33.87,31.502-20.657,57.448-7.907,82.558c5.467,10.737,11.112,21.832,14.282,34.725
		c9.866,39.996-5.948,67.527-6.731,68.845L3.879,458.069l182.031-71.783c29.045,31.377,72.958,50.076,119.294,50.076
		c46.71,0,90.749-18.858,119.776-50.503l182.564,71.942L590.878,429.648z M562.492,191.327c-2.137,13.178-3.401,30.166,0.071,45.036
		L455.716,268.56c-3.045-10.079-7.337-19.838-13.018-29.062L562.492,191.327z M169.313,239.497
		c-5.681,9.225-9.972,18.983-13.017,29.062L49.432,236.345c3.473-14.869,2.208-31.839,0.071-45.018L169.313,239.497z
		 M36.771,259.958c1.033-0.962,1.781-2.119,2.689-3.17l112.51,33.888c-0.41,4.042-0.837,8.067-0.837,12.163
		c0,6.535,0.677,12.982,1.745,19.357L42.683,334.911c-2.92-6.838-6.108-13.142-9.1-19.019
		C21.402,291.941,15.294,279.92,36.771,259.958z M50.056,415.74c3.579-14.763,5.449-35.206-0.178-59.068l109.019-12.571
		c3.099,8.298,6.838,16.4,11.771,24.094L50.056,415.74z M305.206,415.135c-40.21,0-78.158-15.938-103.232-42.702l-5.04-6.197
		c-15.297-18.787-23.382-40.709-23.382-63.396c0-21.992,7.55-43.291,21.832-61.597l0.801-1.033l0.071,0.054
		c24.593-30.772,65.319-49.149,108.948-49.149c44.236,0,85.282,18.752,109.803,50.129c14.282,18.289,21.832,39.587,21.832,61.597
		c0,22.688-8.085,44.608-23.382,63.396l0.463,0.374C389.134,396.989,348.496,415.135,305.206,415.135z M441.328,368.194
		c4.951-7.675,8.689-15.796,11.771-24.094l109.02,12.571c-5.627,23.88-3.757,44.307-0.178,59.068L441.328,368.194z M569.331,334.911
		l-110.195-12.715c1.068-6.375,1.745-12.822,1.745-19.375c0-4.078-0.427-8.12-0.854-12.146l112.51-33.905
		c0.89,1.051,1.656,2.208,2.671,3.17c21.494,19.979,15.368,32.001,3.205,55.952C575.421,321.77,572.233,328.073,569.331,334.911z"
            data-original="#fff"
            className="active-path"
            data-old_color={fillColor}
            fill={fillColor}
          />
        </g>
      )

    default:
      return <g />
  }
}
