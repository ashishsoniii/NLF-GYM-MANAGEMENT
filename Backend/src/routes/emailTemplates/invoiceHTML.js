const invoiceHTML = ({
  name,
  email,
  phone,
  latestPlanName,
  latestPaymentAmount,
  latestPaymentDate,
  duration,
  joiningDate,
  expiryDate,
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
        /* Reset styles */
        * {
            border: 0;
            box-sizing: content-box;
            color: inherit;
            font-family: inherit;
            font-size: inherit;
            font-style: inherit;
            font-weight: inherit;
            line-height: inherit;
            list-style: none;
            margin: 0;
            padding: 0;
            text-decoration: none;
            vertical-align: top;
        }

        /* Content editable styles */
        *[contenteditable] {
            border-radius: 0.25em;
            min-width: 1em;
            outline: 0;
        }

        *[contenteditable] {
            cursor: pointer;
        }

        *[contenteditable]:hover,
        *[contenteditable]:focus,
        td:hover *[contenteditable],
        td:focus *[contenteditable],
        img.hover {
            background: #DEF;
            box-shadow: 0 0 1em 0.5em #DEF;
        }

        span[contenteditable] {
            display: inline-block;
        }

        /* Heading styles */
        h1 {
            font: bold 100% sans-serif;
            letter-spacing: 0.5em;
            text-align: center;
            text-transform: uppercase;
        }

        /* Table styles */
        table {
            font-size: 75%;
            table-layout: fixed;
            width: 100%;
        }

        table {
            border-collapse: separate;
            border-spacing: 2px;
        }

        th,
        td {
            border-width: 1px;
            padding: 0.5em;
            position: relative;
            text-align: left;
        }

        th,
        td {
            border-radius: 0.25em;
            border-style: solid;
        }

        th {
            background: #EEE;
            border-color: #BBB;
        }

        td {
            border-color: #DDD;
        }

        html {
            font: 16px/1 Open Sans, sans-serif;
            overflow: auto;
            padding: 0.5in;
        }

        html {
            background: #999;
            cursor: default;
        }

        body {
            box-sizing: border-box;
            height: 11in;
            margin: 0 auto;
            overflow: hidden;
            padding: 0.5in;
            width: 8.5in;
        }

        body {
            background: #FFF;
            border-radius: 1px;
            box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5);
        }

        /* Header styles */
        header {
            margin: 0 0 3em;
            
        }

    header:after {
            clear: both;
            content: "";
            display: table;
        }

        header h1 {
            background: #000;
            border-radius: 0.25em;
            color: #FFF;
            margin: 0 0 1em;
            padding: 0.5em 0;
        }

        header address {
            float: left;
            font-size: 75%;
            font-style: normal;
            line-height: 1.25;
            margin: 0 1em 1em 0;
        }

        header address p {
            margin: 0 0 0.25em;
        }

        header span,
        header img {
            display: block;
            float: right;
        }

        header span {
            margin: 0 0 1em 1em;
            max-height: 25%;
            max-width: 60%;
            position: relative;
        }

        header img {
            max-height: 100%;
            max-width: 100%;
        }

        header input {
            cursor: pointer;
            -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
            height: 100%;
            left: 0;
            opacity: 0;
            position: absolute;
            top: 0;
            width: 100%;
        }

        /* Article styles */
        article,
        article address,
        table.meta,
        table.inventory {
            margin: 0 0 3em;
        }

        article:after {
            clear: both;
            content: "";
            display: table;
        }

        article h1 {
            clip: rect(0 0 0 0);
            position: absolute;
        }

        article address {
            float: left;
            font-size: 105%;
            font-weight: bold;
        }
        header address {
            float: left;
            font-size: 125%;
            font-weight: bold;
        }

        .meh {
            font-size: 125%;
            font-weight: bold;
        }

        /* Table meta & balance styles */
        table.meta,
        table.balance {
            float: right;
            width: 36%;
        }

        table.meta:after,
        table.balance:after {
            clear: both;
            content: "";
            display: table;
        }

        /* Table meta styles */
        table.meta th {
            width: 40%;
        }

        table.meta td {
            width: 60%;
        }

        /* Table items styles */
        table.inventory {
            clear: both;
            width: 100%;
        }

        table.inventory th {
            font-weight: bold;
            text-align: center;
        }

        table.inventory td:nth-child(1) {
            width: 26%;
        }

        table.inventory td:nth-child(2) {
            width: 38%;
        }

        table.inventory td:nth-child(3) {
            text-align: right;
            width: 12%;
        }

        table.inventory td:nth-child(4) {
            text-align: right;
            width: 12%;
        }

        table.inventory td:nth-child(5) {
            text-align: right;
            width: 12%;
        }

        /* Table balance styles */
        table.balance th,
        table.balance td {
            width: 50%;
        }

        table.balance td {
            text-align: right;
        }

        /* Aside styles */
        aside h1 {
            border: none;
            border-width: 0 0 1px;
            margin: 0 0 1em;
        }

        aside h1 {
            border-color: #999;
            border-bottom-style: solid;
        }

        /* Javascript styles */
        .add,
        .cut {
            border-width: 1px;
            display: block;
            font-size: 0.8rem;
            padding: 0.25em 0.5em;
            float: left;
            text-align: center;
            width: 0.6em;
        }

        .add,
        .cut {
            background: #9AF;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            background-image: -moz-linear-gradient(#00ADEE 5%, #0078A5 100%);
            background-image: -webkit-linear-gradient(#00ADEE 5%, #0078A5 100%);
            border-radius: 0.5em;
            border-color: #0076A3;
            color: #FFF;
            cursor: pointer;
            font-weight: bold;
            text-shadow: 0 -1px 2px rgba(0, 0, 0, 0.333);
        }

        .add {
            margin: -2.5em 0 0;
        }

        .add:hover {
            background: #00ADEE;
        }

        .cut {
            opacity: 0;
            position: absolute;
            top: 0;
            left: -1.5em;
        }

        .cut {
            -webkit-transition: opacity 100ms ease-in;
        }

        tr:hover .cut {
            opacity: 1;
        }

        @media print {
            * {
                -webkit-print-color-adjust: exact;
            }

            html {
                background: none;
                padding: 0;
            }

            body {
                box-shadow: none;
                margin: 0;
            }

            span:empty {
                display: none;
            }

            .add,
            .cut {
                display: none;
            }
        }

        @page {
            margin: 0;
        }
    </style>
</head>
<body>
    <header>
        <h1>Invoice</h1>
        <address contenteditable>
        <p id="senderName">Mahendra Yadav</p>
        <p id="senderAddress">No Limits Fitness</p>
        <p id="senderPhone">9982482431</p>
        </address>
    </header>
    <article>
        <h1>Recipient</h1>
        <br/>
        <address contenteditable>
            <p class="meh" id="recipientCompany"> ${name} </p>
            <h3 class="meh" id="senderAddress"> ${email} </h3>
            <h3 class="meh" id="senderPhone"> ${phone}</h3>

        </address>
        <table class="meta">
          
            <tr>
                <th><span contenteditable>Date</span></th>
                <td><span id="invoiceDate" contenteditable>${latestPaymentDate}</span></td>
            </tr>
            <tr>
                <th><span contenteditable>Validity</span></th>
                <td><span id="invoiceDate" contenteditable>  ${joiningDate}  -  ${expiryDate}</span></td>
            </tr>
            <tr>
                <th><span contenteditable>Amount Due</span></th>
                <td><span id="amountDuePrefix" contenteditable></span><span id="amountDue">0</span></td>
            </tr>
        </table>
        <table class="inventory">
            <thead>
                <tr>
                    <th><span contenteditable>Plan</span></th>
                    <th><span contenteditable>Validity</span></th>
                    <th><span contenteditable>Validity</span></th>
                    <th><span contenteditable>Price</span></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><a class="cut">-</a><span contenteditable id="itemName"> ${latestPlanName}</span></td>
                    <td><span contenteditable id="itemDescription">${joiningDate}  -  ${expiryDate}</span></td>
                    <td><span contenteditable id="itemQuantity"> ${duration} Months </span></td>
                    <td><span data-prefix="$" contenteditable id="itemPrice"> ${latestPaymentAmount}</span></td>
                </tr>
            </tbody>
        </table>
        <table class="balance">
            <tr>
                <th><span contenteditable>Total</span></th>
                <td><span data-prefix="$" id="totalAmount"> ${latestPaymentAmount}</span></td>
            </tr>
        </table>
    </article>
</body>
</html>
  `;
};

module.exports = {
  invoiceHTML,
};
