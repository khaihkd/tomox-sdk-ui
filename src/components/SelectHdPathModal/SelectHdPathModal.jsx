import React from 'react'
import styled from 'styled-components'

import { Button, Dialog, MenuItem, Spinner } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { SmallText, TmColors } from '../../components/Common'

class SelectHdPathModal extends React.PureComponent {

    render() {
      const { 
        isOpen, 
        onClose,
        onHdPathChange,
        hdPaths,
        indexActive,
        error,
        errorList,
        connect,
        loading,
      } = this.props
  
      return (
        <Dialog
          className="dark-dialog"
          onClose={onClose}
          title={<FormattedMessage id="unlockWalletPage.chooseHdPathModal.title" />}
          canOutsideClickClose={false}
          isOpen={isOpen}>
  
          <SubTitle><FormattedMessage id="unlockWalletPage.chooseHdPathModal.subTitle" /></SubTitle>
  
          <SelectHdPath
            items={hdPaths}
            itemRenderer={renderHdPath}
            popoverProps={{ minimal: true, popoverClassName: 'hd-path-tooltip', portalClassName: 'hd-path-tooltip-wrapper' }}
            noResults={<MenuItem disabled text="No results." />}
            filterable={false}
            onActiveItemChange={onHdPathChange}>
              <Button text={`${hdPaths[indexActive].rank}. ${hdPaths[indexActive].path} - ${hdPaths[indexActive].type}`} rightIcon="caret-down" />
          </SelectHdPath>

          <Instruction>
            <FormattedHTMLMessage id="unlockWalletPage.chooseHdPathModal.instruction" />
          </Instruction>
          {error && (
            <React.Fragment>
              <ErrorMessage>{errorList[error.statusCode || error.name]}</ErrorMessage>
              <ErrorMessage><FormattedMessage id="unlockWalletPage.chooseHdPathModal.errorContract" /></ErrorMessage>
            </React.Fragment>
          )}

          <ButtonWrapper width="30%" onClick={connect}>Next {loading && <Spinner intent="PRIMARY" size={Spinner.SIZE_SMALL} />}</ButtonWrapper>
        </Dialog>
      )
    }
}

const renderHdPath = (hdPath, { handleClick, modifiers, query }) => {
    const text = `${hdPath.rank}. ${hdPath.path} - ${hdPath.type}`
  
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={hdPath.rank}
            onClick={handleClick}
            text={text}
            className="hd-path-item"
        />
    )
}


const SubTitle = styled.div`
  margin: 0 0 12px;
`

const Instruction = styled(SmallText)`
  color: ${TmColors.GRAY};
  margin-bottom: 12px;
  line-height: 20px;

  strong {
    color: ${TmColors.LIGHT_GRAY};
  }
`

const SelectHdPath = styled(Select)`
  margin-bottom: 12px;

  .bp3-popover-target {
    width: 100%;
  }

  .bp3-button {
    height: 40px;
    width: 100%;
    border-radius: 0;
  }
`

const ErrorMessage = styled.div`
  color: ${TmColors.RED};
  font-size: 12px;
  margin-bottom: 5px;
`

const ButtonWrapper = styled(Button)`
  display: block;
  margin-top: ${props => props.margintop ? props.margintop : '30px'};
  margin-left: auto;
  margin-right: auto;
  width: ${props => props.width ? props.width : '100%'};
  text-align: center;
  color: ${TmColors.BLACK} !important;
  border-radius: 0;
  background-color: ${TmColors.ORANGE} !important;
  box-shadow: none !important;
  background-image: none !important;
  height: 40px;

  &:hover {
    background-color: ${TmColors.DARK_ORANGE} !important;
  }

  &.bp3-disabled {
    cursor: default !important;
    background-color: ${TmColors.GRAY} !important;
  }import Highlight from '../Common/Highlight';
import { TmColors } from '../Common/Colors';


  .bp3-button-text {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bp3-spinner {
    margin-left: 10px;
  }
`

export default SelectHdPathModal