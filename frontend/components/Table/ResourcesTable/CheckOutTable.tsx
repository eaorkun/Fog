import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { ProjectContext } from 'contexts/Project'
import StandardTextField from '@components/Forms/StandardTextField'
import ConfirmButton from '@components/Button/Confirm/Button'
import { TableFooter } from '@material-ui/core'
import { Resource } from '@functions/interfaces'
import { postRequest, envs } from '@functions/customfuncs'

interface CheckoutTableProps {
    resources: Resource[]
}
const useStyles = makeStyles({
    table: {
        minWidth: 700
    }
})

export default function CheckOutTable({ resources }: CheckoutTableProps) {
    const classes = useStyles()
    const [quantities, setQuantities] = useState<(string | number)[]>([])

    // Load in the Quantities => does the dependency array make sense
    useEffect(() => {
        setQuantities(
            resources.map(() => {
                return ''
            })
        )
    }, [resources])

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) {
        let tempQuantity = [...quantities]
        tempQuantity[index] = isNaN(Number(event.target.value))
            ? event.target.value
            : parseInt(event.target.value)
        setQuantities(tempQuantity)
    }
    function onSubmitQuery() {
        console.log(quantities)
        resources.map((resource, index) => {
            const currentQuantity: any =
                Number(quantities[index]) !== NaN ? quantities[index] : 0
            // Check if quantities checked in is valid
            if (
                currentQuantity >= 1 &&
                currentQuantity <= resource.available_resources
            ) {
                // Call method to check in resources
                resources[index].available_resources -= currentQuantity
                postRequest(
                    `${envs[process.env.appEnv]}/hardware/${
                        resource._id.$oid
                    }/checkout`,
                    { amount: currentQuantity }
                ).then((data) => {
                    console.log(data)
                })
            }
        })
    }
    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="spanning table">
                <TableHead>
                    <TableRow>
                        <TableCell>Resource</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell align="right">Capacity</TableCell>
                        <TableCell align="right">Available</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {resources.map((row, index) => (
                        <TableRow key={row._id.$oid}>
                            <TableCell>{row.title}</TableCell>
                            <TableCell>{`$${row.price.toFixed(
                                2
                            )}/quantity/hr`}</TableCell>
                            <TableCell align="right">{row.capacity}</TableCell>
                            <TableCell align="right">
                                {row.available_resources}
                            </TableCell>
                            <TableCell align="right">
                                <StandardTextField
                                    onChange={(e) => handleChange(e, index)}
                                    error={
                                        quantities[index] === '' ||
                                        (typeof quantities[index] ===
                                            'number' &&
                                            quantities[index] >= 1 &&
                                            quantities[index] <=
                                                row.available_resources)
                                            ? false
                                            : true
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell rowSpan={5} align="center">
                            <ConfirmButton
                                onClick={onSubmitQuery}
                                text="Confirm"
                            />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    )
}
