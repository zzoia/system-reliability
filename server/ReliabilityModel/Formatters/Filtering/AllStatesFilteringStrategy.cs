namespace ReliabilityModel.Model.Formatters.Filtering
{
    public class AllStatesFilteringStrategy : StateFilteringStrategy
    {
        public override bool IncludeState(SystemState systemState) => true;
    }
}