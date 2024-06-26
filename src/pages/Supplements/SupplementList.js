import classNames from 'classnames/bind';
import style from './SupplementList.module.scss';

import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonBase as ResultButton } from '@mui/material';
import { Button, Collapse, Container, Dropdown, DropdownButton, Image } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import images from '~/assets/images';
import config from '~/config';
import Header from '~/layouts/components/Header';
import Loading from '../Loading';
import { useEffect, useState } from 'react';
import SymptomsTable from '~/components/SymptomsTable';
import { useSelector, useDispatch } from 'react-redux';
import * as suggestionService from '~/services/suggestionService';
import { findAreaNameByAreaId, findSymptomListBySymptomIds } from '~/handler';
import { startLoading, stopLoading } from '~/redux/loadingSlice';

const cx = classNames.bind(style);
function SupplementList() {
    const [supplementList, setSupplementList] = useState([]);
    const [supplementListFilter, setSupplementListFilter] = useState([]);
    const [filterAreaId, setFilterAreaId] = useState(-1)
    const [activeSymptoms, setActiveSymptoms] = useState([]);
    const isLoading = useSelector((state) => state.loading);
    const [openTable, setOpenTable] = useState(false);
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (isLoading) {
            document.body.style.backgroundColor = 'rgb(204, 251, 241)';
        }
        return () => {
            document.body.style.backgroundColor = 'white';
        };
    }, [isLoading]);
    
    useEffect(() => {
        const selectedSymptoms = JSON.parse(sessionStorage.getItem('selectedSymptoms')).symptoms;
        setActiveSymptoms(selectedSymptoms);
    }, [])

    const getSymptomsListByAreaId = (filterAreaId) => {
        if(filterAreaId === -1) return supplementList;
        return supplementList.filter((supplement) => supplement.areaId === filterAreaId)
    }

    useEffect(() => {
        setSupplementListFilter(getSymptomsListByAreaId(filterAreaId));
    }, [supplementList, filterAreaId])

    const handleFilter = (k) => {
        setFilterAreaId(Number(k));
    }

    useEffect(() => {
        const fetchAPI = async (symptomName, areaId) => {
            dispatch(startLoading());
            const result = await suggestionService.suggestionList(symptomName);
            if(result !== null) {
                setSupplementList(prev => [...prev, { areaId: areaId, supplements: result }])
            }
            dispatch(stopLoading());
        }
        if(activeSymptoms.length > 0) {
            activeSymptoms.map((activeSymptom) => {
                const symptom = findSymptomListBySymptomIds(activeSymptom.symptomIds)
                fetchAPI(symptom, activeSymptom.areaId);
            })
        }
        return () => {
            dispatch(stopLoading());
            setSupplementList([]);
        }
    }, [activeSymptoms]);

    return isLoading? (
        <Loading />
    ) : (
        <Container className={cx('container')}>
            <Header showBackButton={true} to={config.routes.bodymap} pageNumb={1} />
            <div>
                <h1 style={{ fontWeight: 800, fontSize: '28px' }}>Recommended Supplements</h1>
                <p className={cx('instruction')}>
                    Here are the recommended vitamins and supplements to use for your symptoms
                </p>
            </div>
            <Button bsPrefix={cx('active-symptoms')} onClick={() => setOpenTable(!openTable)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className={cx('symptom-logo')}>
                            <Image src={images.symptom} alt="symptom" />
                        </div>
                        <div style={{ paddingLeft: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', lineHeight: '30px' }}>
                                Active symptoms
                            </h3>
                        </div>
                    </div>
                    <span className={cx('caret', `${openTable ? 'caret-toggle' : ''}`)}></span>
                </div>
            </Button>
            <Collapse in={openTable} style={{ paddingTop: '20px', width: '100%' }}>
                <div style={{ backgroundColor: 'transparent' }}>
                    <SymptomsTable areas={activeSymptoms} />
                </div>
            </Collapse>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}
            >
                <DropdownButton bsPrefix={cx('filter')} title={filterAreaId===-1 ? "Selected All" : findAreaNameByAreaId(filterAreaId)} onSelect={(k) => handleFilter(k)}>
                    <Dropdown.Item eventKey='-1' bsPrefix={cx('filter-item')}>Selected All</Dropdown.Item>
                    {supplementList.map((supplements, index) => (
                            <Dropdown.Item key={index} eventKey={supplements.areaId} bsPrefix={cx('filter-item')}>{findAreaNameByAreaId(supplements.areaId)}</Dropdown.Item>
                    ))}
                </DropdownButton>
                <div className={cx('vitamin-list')}>
                    {supplementListFilter.map((supplements, index) => (
                        <div className={cx('vitamin-list')} key={index}>
                            {filterAreaId===-1 && <h5 style={{ fontWeight: 800, fontSize: '16px' }}>Results for {findAreaNameByAreaId(supplements.areaId)}</h5> }
                            {supplements.supplements.map((supplement, index) => (
                                <NavLink to={`${config.routes.supplement.replace(':name', supplement.name.toLowerCase())}`} key={index}>
                                    <ResultButton
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            height: '100px',
                                            padding: '0 24px',
                                            backgroundColor: '#f1f5f9',
                                            borderColor: '#f1f5f9',
                                            borderRadius: '24px',
                                            color: '#000',
                                            fontSize: '18px',
                                            fontWeight: 800,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                flexDirection: 'column',
                                                gap: '12px',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            {supplement.name}
                                        </div>
                                        <FontAwesomeIcon icon={faAngleRight} style={{ float: 'right' }} />
                                    </ResultButton>
                                </NavLink>
                            ))}
                        </div>
                    
                    ))}
                </div>
            </div>
        </Container>
    )
}

export default SupplementList;
