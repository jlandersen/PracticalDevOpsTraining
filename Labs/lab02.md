# Exercise 2


## Learnings

1. Access Azure using Visual Studio's *Cloud Explorer*
1. Basics about *Shared Access Signatures*
1. Use PowerShell to administrate Azure


## Create Azure Storage for Development

1. Open [Azure Portal](https://portal.azure.com) and sign in.

1. Create a new *Resource group* named `PracticalDevOps-Dev`

1. Add a *Storage account* named `books<yourname>dev` (replace `<yourname>` with your name to get a globally unique storage account name).<br/>
   ![Dev Storage Account](img/dev-storage-account.png)

1. In Visual Studio, add your Azure account to your profile.<br/>
   ![Edit profile](img/visual-studio-add-subscription.png)

1. Use *Cloud Explorer* in Visual Studio to connect to your storage account.<br/>
   ![Cloud Explorer](img/visual-studio-cloud-explorer.png)

1. Use *Cloud Explorer* to create a new Blob Container named `booknametokens`.

1. Upload [BookNameTokens.txt](Assets/Exercise-2-Book-Name-Tokens/BookNameTokens.txt) into the new container.

1. Copy blob URL using *Cloud Explorer*.<br/>
   ![Copy Blob URL](img/copy-blob-url.png)

1. Try to open blob using a browser. It must not work as the blob is private!


## Create Shared Access Signature

1. Open PowerShell with *Azure PowerShell* installed.

1. Use the following script to create a *Shared Access Signature* (SAS) for the uploaded blob (note that you have to replace `<yourname>` accordingly). If you want, experiment with the Azure PowerShell commands.
    ```
    # Set various names
    $resourceGroupName = "PracticalDevOps-Dev"
    $storageAccountName = "books<yourname>dev"
    $containerName = "booknametokens"
    $policyName = "BookNameTokens Policy 2"

    # Sign-in
    Login-AzureRmAccount

    # Optionally: If you have mulitple subscriptions, select the one you want to use
    # Get-AzureRmSubscription
    # Select-AzureRmSubscription -SubscriptionId ...

    $accountKeys = Get-AzureRmStorageAccountKey -ResourceGroupName $resourceGroupName -Name $storageAccountName
    $storageContext = New-AzureStorageContext -StorageAccountName $storageAccountName -StorageAccountKey $accountKeys[0].Value

    $container = Get-AzureStorageContainer -Context $storageContext -Name $containerName
    $cbc = $container.CloudBlobContainer

    $permissions = $cbc.GetPermissions();
    $policy = new-object 'Microsoft.WindowsAzure.Storage.Blob.SharedAccessBlobPolicy'
    $policy.SharedAccessStartTime = $(Get-Date).ToUniversalTime().AddMinutes(-5)
    $policy.SharedAccessExpiryTime = $(Get-Date).ToUniversalTime().AddYears(1)
    $policy.Permissions = "Read"
    $permissions.SharedAccessPolicies.Add($policyName, $policy)
    $cbc.SetPermissions($permissions);

    $policy = new-object 'Microsoft.WindowsAzure.Storage.Blob.SharedAccessBlobPolicy'
    $sas = $cbc.GetSharedAccessSignature($policy, $policyName)
    Write-Host $sas
    ```

1. Copy the ouput of the script (a *Shared Access Signature*) to the clipboard. It should look something like this: `?sv=2015-04-05&sr=c&si=BookNameTokens%20Policy%202&sig=hRQlxasvNZKX3voV%2FEsdf12sdf1MBmmDWRZsJ46bOYo%4X`

1. Copy blob URL using *Cloud Explorer*.<br/>
   ![Copy Blob URL](img/copy-blob-url.png)

1. Try to open blob using a browser, but this time append the SAS. Your URL should look something like this: `https://bookrainerdev.blob.core.windows.net/booknametokens/BookNameTokens.txt?sv=2015-04-05&sr=c&si=BookNameTokens%20Policy%202&sig=hRQlxasvNZKX3voV%2FEsdf12sdf1MBmmDWRZsJ46bOYo%4X`. This time you should be able to download the blob.


## Change Web API
1. Add the necessary NuGet package to get the Azure Storage SDK
   * `Install-Package WindowsAzure.Storage`

1. Add the `BookNameTokenUrl` setting to your `web.config` file. It contains the URL with the SAS. **Note that you have to replace `&` characters with `&amp;` as `web.config` is an XML file.**
   ```
    <?xml version="1.0" encoding="utf-8"?>
    ...
    <configuration>
        <appSettings>
            <add key="MinimumNumberOfBooks" value="1"/>
            <add key="MaximumNumberOfBooks" value="5"/>
            <add key="BookNameTokenUrl" value="https://bookrainerdev.blob.core.windows.net/booknametokens/BookNameTokens.txt?sv=2015-04-05&sr=c&si=BookNameTokens%20Policy%202&sig=hRQlxasvNZKX3voV%2FEsdf12sdf1MBmmDWRZsJ46bOYo%4X"/>
        </appSettings>
        ...
    </configuration>
   ```

1. Search for the following line in `Services/NameGenerator.cs`: `var bookNameTokens = await Task.FromResult(bookNameTokensDummy);`. Describe that we have to replace the static book name tokens with a call to Blob Storage.

1. Replace `Services/NameGenerator.cs` with the implementation from [Exercise-2-Service-Implementation](Assets/Exercise-2-Service-Implementation/NameGenerator.cs).

1. Run your Web Api `http://localhost:2690/api/books` using a browser or *Postman* and note how the book names are now generated based on data from Azure Storage.

## Further Ideas If You Have Time

* Change the implementation to use the storage SDK instead (`WindowsAzure.Storage` NuGet package)
